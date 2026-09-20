#!/usr/bin/env python3
"""Проверки собранного сайта: каждая страница что-то показывает, когда ей делятся.

Теги Open Graph отдаёт шаблон `overrides/main.html`, а не сама страница, и
ошибиться в нём можно тихо. `page` пуста при отрисовке 404 — jinja в этом месте
не падает, а подставляет пустую строку, и весь сайт уезжает с пустым og:title.
Переименовали картинку — og:image остаётся, но ведёт в никуда. Перенесли блок
`social_meta` так, что лендинг не заменяет теги, а дописывает, — og:title
выходит дважды, и какой из них возьмёт сборщик карточки, решает сборщик.

Ничего из этого не заметит ни `mkdocs build --strict` (шаблон отработал),
ни проверка ссылок (теги — не ссылки), ни глаз: карточку видно только там,
куда ссылку вставили.

Только стандартная библиотека, и работает по уже собранному каталогу:

    mkdocs build --strict
    python scripts/check_social.py            # по умолчанию ./site
    python scripts/check_social.py <каталог>
"""

from __future__ import annotations

import pathlib
import re
import sys
from collections import Counter

SITE_URL = "https://drobyshevdev.github.io/lemma/"

# Страницы без собственного адреса: 404 отдаётся с любого пути, поэтому
# требовать от неё уникальный og:url бессмысленно.
NO_OWN_URL = {"404.html", "en/404.html"}


def _meta(html: str, attr: str, name: str) -> list[str]:
    return re.findall(rf'<meta {attr}="{re.escape(name)}" content="([^"]*)"', html)


def main(argv: list[str]) -> int:
    site = pathlib.Path(argv[1] if len(argv) > 1 else "site")
    if not site.is_dir():
        print(f"  каталога со сборкой нет: {site} — сначала mkdocs build", file=sys.stderr)
        return 2

    pages = sorted(site.rglob("*.html"))
    if not pages:
        print(f"  в {site} нет ни одной страницы", file=sys.stderr)
        return 2

    problems: list[str] = []
    titles: Counter[str] = Counter()
    urls: Counter[str] = Counter()

    for page in pages:
        rel = page.relative_to(site).as_posix()
        html = page.read_text(encoding="utf-8", errors="replace")

        for attr, name in (("property", "og:title"), ("property", "og:image"),
                           ("property", "og:url"), ("name", "twitter:card")):
            found = _meta(html, attr, name)
            if not found:
                problems.append(f"{rel}: нет {name}")
            elif len(found) > 1:
                # Ровно то, ради чего social_meta сделан отдельным блоком.
                problems.append(f"{rel}: {name} выведен {len(found)} раза — {found}")
            elif not found[0].strip():
                problems.append(f"{rel}: {name} пуст")

        title = _meta(html, "property", "og:title")
        if len(title) == 1 and title[0].strip():
            titles[title[0]] += 1

        url = _meta(html, "property", "og:url")
        if len(url) == 1 and url[0].strip() and rel not in NO_OWN_URL:
            urls[url[0]] += 1

        card = _meta(html, "name", "twitter:card")
        if card and card[0] != "summary_large_image":
            problems.append(
                f"{rel}: twitter:card = {card[0]}, а карточка 1280×640 — "
                "summary_large_image, иначе её покажут миниатюрой"
            )

        for image in _meta(html, "property", "og:image"):
            if not image.startswith("https://"):
                problems.append(f"{rel}: og:image не абсолютен ({image}) — сборщику карточки нужен адрес")
            elif image.startswith(SITE_URL):
                target = site / image[len(SITE_URL):]
                if not target.is_file():
                    problems.append(f"{rel}: og:image ведёт на {image}, а файла в сборке нет")

    # Одинаковый заголовок на всех — признак того, что шаблон не видит page и
    # подставляет config.site_name. Сборка при этом проходит.
    for title, count in titles.items():
        if count > 2:  # два лендинга, ru и en, законно зовутся одинаково
            problems.append(f"og:title «{title}» повторяется на {count} страницах — шаблон не видит page?")
    for url, count in urls.items():
        if count > 1:
            problems.append(f"og:url {url} повторяется на {count} страницах")

    for problem in problems:
        print(f"  {problem}")
    if problems:
        print(f"\n  проблем: {len(problems)}", file=sys.stderr)
        return 1

    print(f"  {len(pages)} страниц, у каждой свой заголовок и адрес, картинка одна и она на месте.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
