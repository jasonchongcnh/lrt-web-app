# September 2026 timetable fixture

`timetables.json` is the reviewed transcription used by `lrt-app-prototype`,
copied from the workspace's `Timetable/2026-09/timetables.json` archive.
The source is the [Macao LRT route page](https://mlm.com.mo/tc/route.html):
17 timetable images marked September 2026 (Taipa `2026.09_V2`, branch lines
`2026.09`). The archive records visual checks against each source image.

The fixture covers 15 stations, 28 platform directions and 84 schedules across
Monday-Thursday, Friday and weekend/public-holiday service, with 15,208
departures. It is kept independent of the application's dispatch tables so
the regression tests detect mapping errors as well as changed departure times.

For Airport toward Taipa Ferry Terminal, the weekend/public-holiday source
prints the penultimate hour as 24 after hour 22, followed by another hour 24.
The transcription interprets the penultimate row as hour 23 by chronological
position, retaining its printed departure minutes. This is a documented
interpretation of a printed label error, not an operator-confirmed correction.
Extended hour 24 denotes after-midnight service for the preceding operating day.

Run `npm run test:timetable` from the web app repository. The tests use this local
fixture and require no source images or files outside the repository.
