# Subject research — Likud 2026 primary (Step 1, draft)

> Status: **draft — research, not yet approved.** This is the Step-1 issue-space
> research for a future `likud-2026` event (the Likud primary for the 26th
> Knesset list, **17 August 2026**), following the same process that produced
> [`parameters.md`](parameters.md) for the הדמוקרטים 2026 event. Nothing here is
> structural yet: the goal of this document is to identify **which subjects
> discriminate between candidates inside this party**, propose a draft parameter
> set, and flag open questions. Candidate positions + evidence are Step 2
> (per [`candidate-scoring.md`](candidate-scoring.md)).

## Event context

- **What is being elected:** the Likud list for the 26th Knesset (national
  election set for 27 October 2026). Members vote on a **national list**, plus
  separate **district slates** (Jerusalem/Yesha, Dan/Tel-Aviv, Negev, Galilee,
  coastal plain, regional councils, Haifa) and **sector slots** (young, non-Jewish,
  olim, candidates with disabilities, "new woman").
- **The squeeze that shapes the race:** Netanyahu holds **eight reserved
  picks** inside the top 30 (plus reserved slots reportedly for Sa'ar and
  Katz allies), while polling puts Likud around 23–27 seats — so roughly
  **36 sitting MKs/ministers compete over ~16 realistic slots**. Sitting MKs
  were barred from running in district slots, closing the side door. This makes
  the primary unusually zero-sum and loyalty-inflected.
- **Recent ruptures that frame the campaign:** Yuli Edelstein and Dan Illouz
  **left Likud** over the law banning arrests of haredi draft evaders; the
  judicial overhaul and the refusal to establish a state commission of inquiry
  into October 7 cost the party support; the last living hostages were released
  in October 2025 under the Gaza deal, and the argument has shifted to the
  "day after" (ceasefire maintenance vs. renewed decisive action, and Gaza's
  future).

## What Likud members say they care about

An in-depth member survey (elector.co.il, 2026) ranked the issues most
important to מתפקדים:

| Rank | Subject | Share |
|---|---|---|
| 1 | Continuing the military campaign "until victory over Hamas" | 33.8% |
| 2 | Judicial reform | 22.8% |
| 3 | Cost of living | 18.9% |
| 4 | West Bank (Judea & Samaria) sovereignty | 12.5% |
| 5 | Jewish identity in education | 7.1% |
| 6 | Loyalty to the party leadership | 4.9% |

The same survey exposes the sharpest internal cleavage: members who prioritize
the campaign / judicial reform / sovereignty overwhelmingly **opposed
hostage-for-ceasefire deals** (63.1% opposition overall), while members whose
top issue is economic hardship were markedly **more supportive** — an
**ideological vs. pragmatic** split that runs through the whole issue space.

## The discriminating-subject test, applied to Likud

As with the הדמוקרטים event, a subject earns a parameter slot only if it
**divides candidates within this party**. Likud near-consensus items are poor
rankers and stay out of the scalar axes:

- *"Right-wing security policy"*, *"Netanyahu should lead Likud"*, *"opposition
  to a Palestinian state"* — near-consensus among the candidates; no signal.
- Conversely, some nationally-divisive items **do** divide Likud candidates:
  the haredi draft law, the character of an October-7 inquiry, how far/fast to
  push the judicial overhaul, whether to preserve or abandon the Gaza
  ceasefire, and how much independence from the leader is legitimate.

### Candidate-level fault lines observed (to be evidenced in Step 2)

1. **Ceasefire vs. renewed decisive action in Gaza** — the survey's №1 subject
   maps onto real candidate spread: hard-line voices (e.g. Vaturi, May Golan,
   Chikli, Amsalem) vs. more security-establishment/pragmatic profiles
   (e.g. Dichter, Barkat, Eli Cohen, and returnees like Elkin and Uzi Dayan).
2. **Haredi draft** — the post-2025 rupture line. The arrest-ban law drove
   Edelstein and Illouz out; remaining candidates split between defending the
   coalition accommodation and demanding broad enlistment. Strongly
   discriminating and highly salient to the base after the electoral damage.
3. **Judicial overhaul: how central, how far** — support is broad, but
   *intensity* is not: architects/hardliners (Levin, Karhi, Amsalem, Kallner,
   Milwidsky) vs. candidates who favor a negotiated, softer continuation.
   Best framed as pace/priority, not for/against.
4. **October 7 accountability** — a politically appointed inquiry vs. an
   independent state commission; also willingness to talk about responsibility
   at all. Divides loyalists from mavericks (e.g. Gottlieb and Saada have
   records of breaking ranks) and touches the leadership-loyalty nerve.
5. **West Bank sovereignty** — declared-annexation-now advocates (e.g. Buaron,
   Halevi, Kallner — the "Land of Israel" caucus wing) vs. those who defer to
   diplomatic timing (US relations, Saudi normalization track).
6. **Economy: free market vs. cost-of-living interventionism** — the classic
   Likud liberal/populist split (Barkat's free-market platform vs.
   spending/subsidy-oriented candidates), sharpened by the survey's pragmatic
   bloc for whom הוקר המחיה is the top issue.
7. **Jewish identity vs. liberal-national character** — religion & state,
   Jewish identity in education (Chikli's portfolio themes), tradition vs. the
   secular-liberal "national liberal" Likud self-image.
8. **Loyalty vs. independent voice** — in a primary where the leader hand-picks
   eight slots, "will this MK ever say no?" genuinely differentiates
   (unconditional loyalists vs. candidates campaigning on independence).
   **Caution:** wording must stay respectful and positional, not a character
   score (see the honesty-parameter precedent, dropped as defamation-adjacent).

## Draft parameter set (for discussion — not final)

### Scalar axes (voter + candidate position; agreement = `1 − |Δ|`)

| id (proposed) | Pole low (0) | Pole high (1) | Discriminates because |
|---|---|---|---|
| `gaza_posture` | Preserve the ceasefire & deal framework | Renew decisive military action | the ideological/pragmatic split, members' №1 subject |
| `haredi_draft` | Preserve the arrangement with the haredi parties | Broad, enforced enlistment | the rupture that split the party in 2025–26 |
| `judicial_reform_pace` | Pause / negotiated compromise | Complete the overhaul now | intensity divides architects from pragmatists |
| `sovereignty` | Wait for the diplomatic window | Apply sovereignty now | survey №4; "Land of Israel" wing vs. diplomacy-first |
| `economy` | Government intervention on cost of living | Free market, competition, deregulation | Likud's liberal/populist axis; members' №3 subject |
| `oct7_inquiry` | Government-appointed inquiry, after the war chapter closes | Independent state commission now | loyalist/maverick divide with real candidate spread |
| `jewish_identity` | National-liberal, live-and-let-live | Strengthen Jewish identity in education & public sphere | survey №5; Chikli-wing vs. liberal wing |
| `independence` | Full backing of the leadership line | Independent voice inside the party | what a primary vote actually buys the voter |

### Valence (counts only if the voter rates it important)

| id (proposed) | Meaning | Note |
|---|---|---|
| `experience` | Ministerial / parliamentary seniority and record | factual, low-controversy — same rationale as the הדמוקרטים event |

### Set — "which subjects should your candidate champion?" (Jaccard)

Proposed `flagship` options, mirroring the survey's priority list plus classic
Likud retail politics: `security_victory`, `judicial_reform`, `cost_of_living`,
`sovereignty`, `jewish_identity_education`, `draft_equality`,
`periphery_development`, `foreign_relations`.

### Deliberately kept out (so far)

- **"Support for Netanyahu's leadership"** as a scalar — near-consensus among
  candidates *as a public stance*; the usable signal is the `independence` axis
  and the `oct7_inquiry` axis, which capture the same tension positionally.
- **Any honesty/integrity valence** — same defamation-adjacent reasoning as
  before; legal records are for the evidence sidecar, not a score.
- **Hostage policy as its own axis** — the living hostages came home in
  October 2025; the residual disagreement is captured by `gaza_posture`.
- **Watch for merges (Step 2):** `gaza_posture` × `sovereignty` and
  `judicial_reform_pace` × `oct7_inquiry` may correlate strongly across
  candidates. If Step-2 scoring shows they double-count one worldview, merge.

## Scope & platform decisions to settle

1. **Which candidates does the app rank?** Recommendation: **the national list
   (43 candidates)** — every member nationwide votes on it, and it's where the
   ideological choice lives. District slates and sector slots are separate
   ballots with regional/sectoral logic; listing them as ranked candidates
   would mislead. They can appear as reference content later.
2. **Hebrew-only event.** Per product decision (11 Aug 2026), this event ships
   **without English translations**. The platform currently requires every data
   id to have strings in *every* locale catalog (validator + convention). The
   event-locale layering from the multi-event work helps, but we must choose:
   (a) relax the validator to per-event locale declarations, or (b) auto-fall
   back en→he for this event. To be decided in the implementation PR.
3. **Timing.** The primary is on 17 August; if the event ships after that date
   it enters as a `past` event with `results.json` (raw vs. final is *very*
   relevant here: reserved picks, district seats, sector slots and women's
   floors heavily reshape vote-order into the final list — exactly what the
   raw/final divergence view was built for).

## Appendix — official candidate lists (from party PDFs, as of 09.08.2026 14:00)

Transcribed from the three official notices supplied by the product owner
(national + sector lists 09.08.26; district lists 09.08.26; late-additions
notice 04–06.08.26). `*` = awaiting a qualifying-period exemption (קיצור פז"ם).

### National list (ארצי 100) — 43 candidates

| # | Name | | # | Name |
|---|---|---|---|---|
| 101 | אמיר אוחנה | | 125 | יריב לוין |
| 102 | זאב אלקין* | | 126 | חנוך מילביצקי |
| 103 | דודי אמסלם | | 127 | עידית סילמן |
| 104 | אביחי בוארון | | 128 | משה סעדה |
| 105 | דוד ביטן | | 145 | עפיף עבד |
| 106 | בועז ביסמוט | | 129 | חוה אתי עטיה |
| 107 | איל בן פנחס | | 130 | משה פסל |
| 108 | עדי ברוך | | 131 | מלקו צגה |
| 109 | ניר ברקת | | 132 | דרור קאפח* |
| 110 | ששון (ששי) גואטה | | 133 | יואב קיש |
| 111 | טלי גוטליב | | 134 | שי קלך* |
| 112 | מאי גולן | | 135 | אריאל קלנר |
| 113 | גילה גמליאל | | 136 | שלמה קרעי |
| 114 | עוזי דיין | | 137 | אליהו רביבו |
| 115 | אבי דיכטר | | 138 | מירי (מרים) רגב |
| 116 | אלי דלל | | 144 | קטי (קטרין) שטרית |
| 143 | שלום דנינו | | 139 | עמיחי שיקלי |
| 117 | עמית הלוי | | 140 | אושר שקלים |
| 118 | ניסים ואטורי | | 141 | אליהו שתיוי* |
| 119 | מיקי (מכלוף) זוהר | | | |
| 121 | ישראל כ"ץ | | | |
| 122 | אלי כהן | | | |
| 123 | אופיר כץ | | | |
| 124 | חיים כץ | | | |

Notable: Ze'ev Elkin returns to Likud; Uzi Dayan returns; Edelstein and Illouz
are absent (left the party); Netanyahu is not on this ballot (leader chosen
separately) but holds eight reserved picks.

### Sector slots (voted within the national ballot)

- **צעירים 160:** נתנאל אוחיון (161), טופז דויטש רם (162), מאי הדר (163),
  דרור לגאלי (164), עידן מזוז (165), דין מילוא (166), מורי מאיר עורקבי (167),
  ויקטור שריקי (168)
- **מגזר לא יהודי 170:** ראזי אבו כף (171), סמיר זידאן (172), מולא מולא (173),
  אוסמה נבואני (174), איוב קרא (175), שכיב שנאן (176)
- **עולים 180:** אברהם דז'ורייב (189), גברה וורקו (181), ויטלי חייקין (188),
  פבל יליזרוב (182), אדי כהן (183), לורנט שלמה פריינטי* (184), יחיא קפרי (186)
- **מוגבלויות 190:** אמציה אהרון מיכאליס (191), עודד יהודה סושרד (192),
  אלכס פרידמן (193), אביחי שאשא כהן (194), שמעון שראל (195)
- **אישה חדשה 200:** קרן אטיאס בובליל (201), חלי הולצמן (202), אוסנת זוהר זני
  (216), אלמז זרו (203), הדר מוכתר* (204), סמדר מורס* (205), סילבה מזרחי (206),
  חיה מלול גז (207), נורית מנחם (208), מרה מרו סנבטו (209), נועה שושן ברסקין
  (211), איריס שטגמן (212), סמדר הילה שמואלי (213), אתי תלמי (214)

### District slates

- **ירושלים, יש"ע ושפלה 300:** אביב איטח (301), מישאל בן עמי (302), יואל
  בן-שושן (303), יגאל ברנד (304), יאיר גבאי (305), הדס-מלכה הכהן* (307), גיל
  חדד (309), בריאן טאו (321), יהונתן יוסף (311), זיו מאור (313), גרשון מסיקה
  (320), ג'קי פינטו (322), שחר צפניה* (314), שבתאי קטש (315), דביר שטריקר
  (317), ארז תדמור (319)
- **דן ות"א 400:** עומרי אקוניס (401), קובי גבריאל (402), דור חרלפ (405), שלמה
  לרנר (407), אורן מגנזי (408), שלמה מוסלאי (415), סיני קהת* (410), אלישיב
  רבין (404), גל שבתאי (414), עומרי שמחי (411)
- **נגב 500:** אלעד זמיר (503), עזרא עוזר (506), יוסי פיטוסי (504), משה בנימין
  פרץ (505)
- **גליל ועמקים 600:** שוקי (יהושע) אוחנה (601), ליאור לסרי (603), משה (מושיקו)
  פיניאן (605), יאיר אדי פריימן (606)
- **מישור החוף 700:** אליהו (אלי) אלוש (701), שי גלילי (702), נמרוד מדרר (704),
  אבי מלכי (705), אפי נוה (706), ראובן עודד (707)
- **מועצות אזוריות 800:** רמי ברדוגו (801), מטי יוגב (802), יהודה כהן (808),
  דוד מגידיש (803), שרון סעדה (805), שי שוקרון (806), קובי שמואל (807)
- **חיפה 900:** אייל אלי (902), צביאל רובין (903)

## Sources

- Official Likud candidate notices (three PDFs supplied by the product owner,
  04–09 Aug 2026) — transcribed above.
- [Likud — בחירות מקדימות לכנסת ה-26](https://www.likud.org.il/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA/%D7%9B%D7%A0%D7%A1%D7%AA/knesset26)
- [elector.co.il — סקר עומק בליכוד: מה הנושאים החשובים ביותר למתפקדים](https://elector.co.il/seker/seker-likud.html)
- [ynet — 36 ייאבקו על כ-16 מקומות ריאליים](https://www.ynet.co.il/news/article/skgluk1ife)
- [ynet — כולם נגד כולם בפריימריז בליכוד](https://www.ynet.co.il/news/article/bylqvzdizx)
- [Times of Israel — Sa'ar, Katz to receive reserved slots on Likud list](https://www.timesofisrael.com/saar-katz-to-receive-reserved-slots-on-likud-list-expanding-pms-control-of-party-slate/)
- [Times of Israel — Knesset passes law banning arrests of Haredi draft dodgers](https://www.timesofisrael.com/knesset-passes-law-banning-arrests-of-haredi-draft-dodgers-legitimizing-ongoing-non-enlistment/)
- [Times of Israel — Likud MK resigns, says party 'hijacked by Haredi interests'](https://www.timesofisrael.com/likud-mk-announces-resignation-says-party-has-been-hijacked-by-haredi-interests/)
- [ynetnews — Netanyahu turns on Haredi allies after draft deal backfires](https://www.ynetnews.com/article/bjlrj2tegg)
- [Israel Policy Forum — Israeli Party Lists: From Primaries to Direct Selection](https://israelpolicyforum.org/2026/07/22/israeli-party-lists-from-primaries-to-direct-selection)
- [Steptoe — Israel's 2026 Elections: The Political Landscape](https://www.steptoe.com/en/news-publications/stepwise-risk-outlook/israels-2026-elections-the-political-landscape-and-strategic-outlook.html)
