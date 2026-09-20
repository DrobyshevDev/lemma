#!/usr/bin/env python3
"""Проверки страниц модулей: каждая ведёт к своему ноутбуку, и его можно открыть.

CI уже исполняет каждый ноутбук и собирает сайт со `--strict`. Ни то, ни другое
не заметит модуль, который ссылается на несуществующий файл (ссылка внешняя,
mkdocs её не проверяет), ноутбук, на который не ведёт ни одна страница, или
страницу без ссылки «открыть в Colab» — а без неё читателю, чтобы запустить код,
нужно клонировать репозиторий, поставить Python и поднять Jupyter. Курс, который
обещает, что код запускается за секунды, не должен начинаться с этого.

Только стандартная библиотека: CI незачем ставить что-то ради проверки ссылок.

    python scripts/check_modules.py
"""

from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MODULES = ROOT / "docs" / "modules"
NOTEBOOKS = ROOT / "notebooks"

GITHUB = "https://github.com/DrobyshevDev/lemma/blob/main/notebooks/"
COLAB = "https://colab.research.google.com/github/DrobyshevDev/lemma/blob/main/notebooks/"

# Заголовочная строка модуля: ссылка на файл и ссылка на запуск, в таком порядке.
HEADER = re.compile(
    r"\*\*(?:Ноутбук|Notebook):\*\* "
    r"\[(?:открыть в Colab|open in Colab)\]\(" + re.escape(COLAB) + r"(?P<file>[\w.-]+\.ipynb)\)"
    r" · \[`notebooks/(?P=file)`\]\(" + re.escape(GITHUB) + r"(?P=file)\)"
)


def main() -> int:
    problems: list[str] = []
    on_disk = {p.name for p in NOTEBOOKS.glob("*.ipynb")}
    referenced: set[str] = set()

    pages = sorted(MODULES.glob("*.md"))
    if not pages:
        print(f"  страниц модулей нет в {MODULES}", file=sys.stderr)
        return 2

    for page in pages:
        text = page.read_text(encoding="utf-8")

        header = HEADER.search(text)
        if header is None:
            problems.append(
                f"{page.name}: нет заголовочной строки с ноутбуком и ссылкой на Colab "
                "в ожидаемом виде"
            )
        else:
            referenced.add(header.group("file"))

        # Любая ссылка на ноутбук, не только заголовочная: модули ссылаются на
        # свой ноутбук и в тексте задания.
        for name in re.findall(r"notebooks/([\w.-]+\.ipynb)", text):
            referenced.add(name)
            if name not in on_disk:
                # Модуль ссылается на свой ноутбук и в шапке, и в задании.
                # Сообщать об одном и том же файле трижды — не отчёт, а шум.
                problem = f"{page.name}: ссылается на {name}, которого нет"
                if problem not in problems:
                    problems.append(problem)

    orphans = sorted(on_disk - referenced)
    for name in orphans:
        problems.append(f"notebooks/{name}: на него не ведёт ни одна страница модуля")

    for problem in problems:
        print(f"  {problem}")
    if problems:
        print(f"\n  проблем: {len(problems)}", file=sys.stderr)
        return 1

    print(f"  {len(pages)} страниц, {len(on_disk)} ноутбуков — все связаны и открываются в Colab.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
