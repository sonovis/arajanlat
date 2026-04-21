#let data = json("data.json")

#let megrendelő = data.megrendelő
#let megrendelő_cím = data.megrendelő_cím
#let feladat_leírása = data.feladat_leírása
#let datum = datetime(
  year: data.datum.year,
  month: data.datum.month,
  day: data.datum.day
)

#let kedvezmény = data.kedvezmény
#let tételek = data.tételek



#let fmt_number(number, digits: 0) = {
  let integer = calc.trunc(number)
  let decimal = calc.fract(number)
  let res = str(integer).clusters()
                        .rev()
                        .chunks(3)
                        .map(c => c.join(""))
                        .join(" ")
                        .rev()
  if digits != 0 {
    res += ","
    decimal = calc.round(decimal, digits: digits)
    let decimal_len = str(decimal).len() - 2
    if digits > decimal_len {
      decimal = str(decimal) + ("0" * (digits - decimal_len))
    }
    decimal = str(decimal).slice(2)
    res += decimal
  }
  return res
}



#set page(
  background: context {
    place(bottom, dy: 12pt, dx: 43pt, rotate(-6deg, origin: bottom + left, image("assets/Vonalak.png", fit: "contain", width: 115%)))
    place(bottom + right, image("assets/logo-text-color.svg", fit: "contain", width: 25%), dy: -35pt, dx: -70pt)
  },
  margin: (bottom: 200pt)
)

#set text(font: "Oxanium", size: 12pt, weight: 400, fill: black.transparentize(40%))

#show heading.where(level: 1): set text(font: "LT Wave", weight: 700, size: 2em, fill: rgb("#652291"))
#show heading.where(level: 2): set text(font: "LT Wave", weight: 600, size: 1.6em, fill: rgb("#652291"))
#show heading.where(level: 3): set text(font: "LT Wave", weight: 500, size: 1.6em, fill: rgb("#652291"))


#let underlined_heading(body) = context {
  let size = measure(body)
  [#body #line(length: size.width, stroke: 2pt + black.transparentize(50%))]
}

\
#underlined_heading[= Árajánlat]

\
== Kiállító
Sonovis Event Tech Kft. \
2000 Szentendre Bartók Béla út 5/b \
32805141-2-13  \
#link("mailto:info@sonovis.hu")

\
== Megrendelő
#megrendelő \
#megrendelő_cím

#pagebreak()

=== A feladat leírása


#feladat_leírása

Az esemény dátuma: *#datum.display("[year].[month].[day]") *


#set table(
  fill: (_, y) => if y == 0 { rgb("#c0c0ca") } else if calc.even(y) { rgb("#eaeaef") } else { rgb("#f3f3f3") },
  inset: (x: 10pt, y: 10pt),
  stroke: none,
)

#let sum = tételek.map(t => t.ár * t.darab).sum()
#let kedvezményes_ár = calc.round(sum * (100 - kedvezmény) / 100)


=== Ártábla

#block(
  clip: true,
  radius: 10pt,
  table(
    columns: (1fr, auto, auto, auto),
    table.header(
      repeat: true,
      [*Tétel*], [*Darab*], [*Egységár*], [*Ár (nettó)*]
    ),
    ..for t in tételek {
      (
        [#t.megnevezés],
        [#t.darab db],
        [#fmt_number(t.ár) Ft],
        [#fmt_number(t.darab * t.ár) Ft]
      )
    }
  )
)
  
#block(
  fill: rgb("#f3f3f3"),
  inset: 15pt,
  radius: 10pt,
  width: 100%,

  grid(
    columns: (1fr, 1fr),
    row-gutter: 1em,

    [Részösszeg:], align(right)[#fmt_number(sum) Ft],

    if kedvezmény > 0 [
      #text(fill: gray)[Kedvezmény (#kedvezmény%):]
    ],
    
    if kedvezmény > 0 [
      #align(right)[#text(fill: gray)[-#fmt_number(sum - kedvezményes_ár) Ft]]
    ],

    grid.cell(colspan: 2)[
      #line(length: 100%)
    ],

    text(weight: 600)[Összesen:],
    align(right)[#text(weight: 600)[#fmt_number(kedvezményes_ár) Ft]],
  )
)

#text(size: 0.6em, fill: black, "Az feltüntetett árak az általános forgalmi adót nem tartalmazzák.")