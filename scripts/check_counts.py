#!/usr/bin/env python3
"""Числа, которые курс говорит о себе, сходятся с тем, из чего он состоит.

Курс называет себя «двадцать семь модулей в семи частях» в обоих README, на
двух лендингах, в двух программах, в двух бейджах, в CITATION.cff и в
.zenodo.json — цифрами, русскими словами и английскими. Ни одно из этих мест не
знает, сколько модулей на самом деле. Добавить модуль — значит попасть в
каждое из них и ни разу не ошибиться, а первая же неправка живёт до тех пор,
пока кто-нибудь не пересчитает руками.

Сколько мест проверено, скрипт говорит сам: число утверждений — тоже число,
которое ему незачем знать наизусть.

Здесь считается ровно один раз — по `docs/modules/`, `notebooks/` и таблицам
программы, — а дальше каждое утверждение сверяется с этим счётом.

Отдельно сверяются недели: программа обещает «около 50 недель» и «части I–II —
столько-то», и оба числа есть сумма колонки «Время» в её же таблицах. Такую
сумму никто не пересчитывает, правя одну строку.

Пропавшее утверждение — тоже расхождение. Если фразу перепишут так, что шаблон
перестанет находиться, проверка перестанет проверять и промолчит об этом;
поэтому ненайденное место сообщается наравне с разошедшимся числом.

Только стандартная библиотека.

    python scripts/check_counts.py
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Слова до сорока: курс из сорока модулей — уже другой курс, и падение проверки
# на сорок первом правильно, а не недосмотр.
RU_ONES = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять",
           "десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать",
           "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"]
RU_TENS = {20: "двадцать", 30: "тридцать", 40: "сорок"}
EN_ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
           "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
           "sixteen", "seventeen", "eighteen", "nineteen"]
EN_TENS = {20: "twenty", 30: "thirty", 40: "forty"}


def ru_word(n: int) -> str:
    if n < 20:
        return RU_ONES[n]
    tens, ones = divmod(n, 10)
    return (RU_TENS[tens * 10] + (f" {RU_ONES[ones]}" if ones else "")).strip()


def en_word(n: int) -> str:
    if n < 20:
        return EN_ONES[n]
    tens, ones = divmod(n, 10)
    return EN_TENS[tens * 10] + (f"-{EN_ONES[ones]}" if ones else "")


#: Предложный падеж тех же числительных: «в семи частях», не «в семь частях».
#: Правило «мягкий знак на -и» ловит пять…двадцать и тридцать, но не первые
#: четыре, не восемь (восьми, а не «восеми») и не сорок — они названы отдельно.
RU_PREP_IRREGULAR = {1: "одном", 2: "двух", 3: "трёх", 4: "четырёх", 8: "восьми",
                     40: "сорока"}


def ru_word_prep(n: int) -> str:
    if n in RU_PREP_IRREGULAR:
        return RU_PREP_IRREGULAR[n]
    if n < 20 or n in RU_TENS:
        return ru_word(n).removesuffix("ь") + "и"
    tens, ones = divmod(n, 10)
    return f"{ru_word_prep(tens * 10)} {ru_word_prep(ones)}"


def ru_plural(n: int, one: str, few: str, many: str) -> str:
    """модуль / модуля / модулей — по последним цифрам, как в русском."""
    if 11 <= n % 100 <= 14:
        return many
    last = n % 10
    return one if last == 1 else few if 2 <= last <= 4 else many


def read(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


def parse_programme(name: str) -> tuple[list[tuple[str, list[int], float]], float]:
    """Части программы: римская цифра, номера модулей, сумма недель."""
    parts: list[tuple[str, list[int], float]] = []
    inside = False
    for line in read(f"docs/{name}").splitlines():
        head = re.match(r"^## (?:Часть|Part) ([IVX]+)\.", line)
        if head:
            parts.append((head.group(1), [], 0.0))
            inside = True
            continue
        if line.startswith("## "):
            inside = False
        row = re.match(
            r"^\| (\d+) \| \[[^\]]+\]\(modules/[\w.-]+\.md\).*\| ([^|]+) \|\s*$", line
        )
        if row and inside:
            weeks = re.search(r"([\d.]+)", row.group(2))
            name_, numbers, total = parts[-1]
            numbers.append(int(row.group(1)))
            parts[-1] = (name_, numbers, total + (float(weeks.group(1)) if weeks else 0.0))
    return parts, sum(p[2] for p in parts)


def main() -> int:
    problems: list[str] = []

    checked: list[str] = []

    def want(where: str, pattern: str, what: str) -> None:
        """Сверить одно утверждение. Не найдено — тоже расхождение."""
        checked.append(where)
        if re.search(pattern, read(where), re.M) is None:
            problems.append(f"{where}: ждали {what} — не сходится или фразу переписали")

    # ---- то, из чего курс состоит -------------------------------------------
    ru_pages = sorted(p for p in (ROOT / "docs" / "modules").glob("*.md")
                      if not p.name.endswith(".en.md"))
    en_pages = sorted((ROOT / "docs" / "modules").glob("*.en.md"))
    notebooks = sorted((ROOT / "notebooks").glob("*.ipynb"))
    n = len(ru_pages)
    if not n:
        print("  страниц модулей нет", file=sys.stderr)
        return 2

    if len(en_pages) != n:
        problems.append(f"docs/modules: {n} страниц по-русски и {len(en_pages)} по-английски")
    if len(notebooks) != n:
        problems.append(f"notebooks: {len(notebooks)} ноутбуков на {n} модулей")

    ru_parts, ru_weeks = parse_programme("programme.md")
    en_parts, en_weeks = parse_programme("programme.en.md")
    parts = len(ru_parts)
    numbered = [i for p in ru_parts for i in p[1]]

    if numbered != list(range(1, n + 1)):
        problems.append(
            f"docs/programme.md: модули пронумерованы {numbered}, а страниц {n} — "
            "номер пропущен или задвоен"
        )
    if [p[1] for p in en_parts] != [p[1] for p in ru_parts]:
        problems.append("docs/programme.en.md: разбивка по частям не та же, что в русской")
    if ru_weeks != en_weeks:
        problems.append(f"недели расходятся между языками: {ru_weeks:g} и {en_weeks:g}")

    n_ru, n_en = ru_word(n), en_word(n)
    p_ru, p_en = ru_word(parts), en_word(parts)
    p_ru_prep = ru_word_prep(parts)
    modules_ru = ru_plural(n, "модуль", "модуля", "модулей")
    parts_ru = ru_plural(parts, "часть", "части", "частей")
    parts_ru_prep = ru_plural(parts, "части", "частях", "частях")

    # ---- то, что курс о себе говорит ----------------------------------------
    want("README.md", rf"img\.shields\.io/badge/модулей-{n}-", f"бейдж модулей-{n}")
    want("README.md", rf"(?i)все {n} {modules_ru}", f"«все {n} {modules_ru}»")
    want("README.md", rf"(?i){n_ru} {modules_ru} в {p_ru_prep} {parts_ru_prep}",
         f"«{n_ru} {modules_ru} в {p_ru_prep} {parts_ru_prep}»")
    want("README.md", rf"(?i)все {n_ru} {modules_ru} готовы", f"«все {n_ru} {modules_ru} готовы»")

    want("README.en.md", rf"img\.shields\.io/badge/modules-{n}-", f"бейдж modules-{n}")
    want("README.en.md", rf"(?i)all {n} modules", f"«all {n} modules»")
    want("README.en.md", rf"(?i){n_en} modules in {p_en} parts",
         f"«{n_en} modules in {p_en} parts»")
    want("README.en.md", rf"(?i)all {n_en} modules are done", f"«all {n_en} modules are done»")

    want("docs/programme.md", rf"(?i)^{n_ru} {modules_ru} в {p_ru_prep} {parts_ru_prep}\.",
         f"«{n_ru} {modules_ru} в {p_ru_prep} {parts_ru_prep}.»")
    want("docs/programme.en.md", rf"(?i)^{n_en} modules in {p_en} parts\.",
         f"«{n_en} modules in {p_en} parts.»")

    want("overrides/home.html", rf"<span>{n} {modules_ru}</span>", f"«{n} {modules_ru}» в плашке")
    want("overrides/home.html", rf"(?i)<h2>{p_ru} {parts_ru}, {n_ru} {modules_ru}</h2>",
         f"заголовок «{p_ru} {parts_ru}, {n_ru} {modules_ru}»")
    want("overrides/home.en.html", rf"<span>{n} modules</span>", f"«{n} modules» в плашке")
    want("overrides/home.en.html", rf"(?i)<h2>{p_en} parts, {n_en} modules</h2>",
         f"заголовок «{p_en} parts, {n_en} modules»")

    want("CITATION.cff", rf"(?i){n_en} modules in {p_en} parts",
         f"«{n_en} modules in {p_en} parts»")
    want(".zenodo.json", rf"(?i){n_en} modules in {p_en} parts",
         f"«{n_en} modules in {p_en} parts»")

    nav = len(re.findall(r"modules/[\w.-]+\.md", read("mkdocs.yml")))
    if nav != n:
        problems.append(f"mkdocs.yml: в навигации {nav} модулей, а страниц {n}")

    # ---- недели -------------------------------------------------------------
    # «Около 50» — округление, поэтому допуск; части I–II названы точно,
    # поэтому точное сравнение.
    for name, source, about, exact in (
        ("docs/programme.md", ru_parts, r"\*\*Около (\d+) недель\*\*", r"I–II \((\d+) недель\)"),
        ("docs/programme.en.md", en_parts, r"\*\*About (\d+) weeks\*\*", r"I–II \((\d+) weeks\)"),
    ):
        text = read(name)
        total = sum(p[2] for p in source)
        head = sum(p[2] for p in source[:2])

        found = re.search(about, text)
        if found is None:
            problems.append(f"{name}: не нашлось общее число недель")
        elif abs(int(found.group(1)) - total) > 2:
            problems.append(
                f"{name}: обещано {found.group(1)} недель, в таблицах {total:g} — "
                "это уже не округление"
            )

        found = re.search(exact, text)
        if found is None:
            problems.append(f"{name}: не нашлось число недель на части I–II")
        elif int(found.group(1)) != head:
            problems.append(
                f"{name}: части I–II названы как {found.group(1)} недель, "
                f"а их собственные таблицы дают {head:g}"
            )

    # .zenodo.json должен ещё и разбираться. Неразбираемый файл Zenodo просто
    # не прочтёт, а релиз при этом выйдет — с записью по умолчанию и без
    # авторов. Сообщением, а не исключением: падать трейсбэком там, где
    # остальные расхождения читаются строкой, — плохой отчёт.
    try:
        json.loads(read(".zenodo.json"))
    except json.JSONDecodeError as broken:
        problems.append(f".zenodo.json: не разбирается как JSON — {broken}")

    for problem in problems:
        print(f"  {problem}")
    if problems:
        print(f"\n  расхождений: {len(problems)}", file=sys.stderr)
        return 1

    weeks_ru = ru_plural(int(ru_weeks), "неделя", "недели", "недель")
    print(
        f"  {n} {modules_ru} в {parts} {parts_ru_prep}, {len(notebooks)} ноутбуков, "
        f"{ru_weeks:g} {weeks_ru} — и все {len(checked)} мест, где курс это говорит "
        f"({len(set(checked))} файлов), говорят то же."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
