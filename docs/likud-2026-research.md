# Voter-issue research — הליכוד 2026 primary (26th Knesset list)

> Status: **research draft (Step 0).** This document opens the research process
> for a new event (`likud-2026`): what subjects actually interest Likud
> primaries voters, so we can derive a parameter space and questionnaire the
> way we did for הדמוקרטים (see [`parameters.md`](parameters.md) for the
> finalized product of that process, and [`data-model.md`](data-model.md) for
> the shared vector-space model). Nothing here is structural data yet — the
> approved parameter set (Step 1) and candidate positions + evidence (Step 2)
> come after this is reviewed.

## The event

- **Party:** הליכוד — תנועה לאומית ליברלית (Likud, national-liberal).
- **What is being elected:** the Likud candidate list for the **26th Knesset**
  (general election expected autumn 2026).
- **Primary date:** **17 August 2026**; final results published ~20 August.
- **Leadership:** not contested — Netanyahu is the sole leadership candidate.
  The leader also holds **7–8 reserved slots** in the top three deciles
  (agreed with Haim Katz), so the primary ranks the *rest* of the list.
- **Electorate:** ~142,000 eligible members (16-month seniority to vote,
  3-year seniority to run). Media analysis estimates ~60% are "free voters"
  and ~40% belong to organized blocs (aerospace industry, railways, airports
  authority) that vote in coordinated deals.

**Why this matters for us:** primaries.fit serves the *free* voter deciding on
substance. The organized-bloc/deal layer is a real ranking force in Likud
primaries, but it is exactly the thing an issue-based engine deliberately
ignores — worth saying openly on the event's methodology page.

### Ballot structure (affects questionnaire design — open question)

Unlike הדמוקרטים, the Likud list is assembled from **a national slate plus
district and sector slates** (Jerusalem/Yesha/Shfela, Dan/Tel-Aviv, Negev,
Galilee/Valleys, Coast, Haifa, regional councils; sectors: young members,
non-Jewish, olim, "new woman", disabilities), with sector votes cast inside
the national ballot. A member typically marks **multiple candidates**, not
one. Our engine ranks all candidates on one shared issue space regardless,
but the results screen should probably group by slate so the ranking maps to
what the voter can actually mark. **Decide in Step 1.**

## The candidates (official roster, as filed)

Source: three official Likud PDFs (candidate lists as of 9 Aug 2026, 14:00,
plus a supplementary sheet). `*` = awaiting a seniority-period exemption.

### National slate (ארצי, 100) — 44 candidates

| # | Name | | # | Name |
|---|------|-|---|------|
| 101 | אמיר אוחנה | | 126 | חנוך מילביצקי |
| 102 | זאב אלקין* | | 127 | עידית סילמן |
| 103 | דודי אמסלם | | 128 | משה סעדה |
| 104 | אביחי בוארון | | 129 | חוה אתי עטיה |
| 105 | דוד ביטן | | 130 | משה פסל |
| 106 | בועז ביסמוט | | 131 | מלקו צגה |
| 107 | איל בן פנחס | | 132 | דרור קאפח* |
| 108 | עדי ברוך | | 133 | יואב קיש |
| 109 | ניר ברקת | | 134 | שי קלך* |
| 110 | ששון (ששי) גואטה | | 135 | אריאל קלנר |
| 111 | טלי גוטליב | | 136 | שלמה קרעי |
| 112 | מאי גולן | | 137 | אליהו רביבו |
| 113 | גילה גמליאל | | 138 | מירי (מרים) רגב |
| 114 | עוזי דיין | | 139 | עמיחי שיקלי |
| 115 | אבי דיכטר | | 140 | אושר שקלים |
| 116 | אלי דלל | | 141 | אליהו שתיוי* |
| 117 | עמית הלוי | | 143 | שלום דנינו |
| 118 | ניסים ואטורי | | 144 | קטי (קטרין) שטרית |
| 119 | מיקי (מכלוף) זוהר | | 145 | עפיף עבד |
| 121 | ישראל כ"ץ | | | |
| 122 | אלי כהן | | | |
| 123 | אופיר כץ | | | |
| 124 | חיים כץ | | | |
| 125 | יריב לוין | | | |

### District slates

**ירושלים, יש"ע ושפלה (300):** אביב איטח, מישאל בן עמי, יואל בן-שושן,
יגאל ברנד, יאיר גבאי, הדס-מלכה הכהן*, גיל חדד, בריאן טאו, יהונתן יוסף,
זיו מאור, גרשון מסיקה, ג'קי פינטו, שחר צפניה*, שבתאי קטש, דביר שטריקר,
ארז תדמור.

**דן ות"א (400):** עומרי אקוניס, קובי גבריאל, דור חרלפ, שלמה לרנר,
אורן מגנזי, שלמה מוסלאי, סיני קהת*, אלישיב רבין, גל שבתאי, עומרי שמחי.

**נגב (500):** אלעד זמיר, עזרא עוזר, יוסי פיטוסי, משה בנימין פרץ.

**גליל ועמקים (600):** שוקי (יהושע) אוחנה, ליאור לסרי, משה (מושיקו) פיניאן,
יאיר אדי פריימן.

**מישור החוף (700):** אליהו (אלי) אלוש, שי גלילי, נמרוד מדרר, אבי מלכי,
אפי נוה, ראובן עודד.

**מועצות אזוריות (800):** רמי ברדוגו, מטי יוגב, יהודה כהן, דוד מגידיש,
שרון סעדה, שי שוקרון, קובי שמואל.

**חיפה (900):** אייל אלי, צביאל רובין.

### Sector slates (voted within the national ballot)

**צעירים (160):** נתנאל אוחיון, רם טופז דויטש, מאי הדר, דרור לגאלי,
עידן מזוז, דין מילוא, מורי מאיר עורקבי, ויקטור שריקי.

**מגזר לא יהודי (170):** ראזי אבו כף, סמיר זידאן, מולא מולא, אוסמה נבואני,
איוב קרא, שכיב שנאן.

**עולים (180):** אברהם דז'ורייב, גברה וורקו, ויטלי חייקין, פבל יליזרוב,
אדי כהן, לורנט שלמה פריינטי*, יחיא קפרי.

**מוגבלויות (190):** אמציה אהרון מיכאליס, עודד יהודה סושרד, אלכס פרידמן,
אביחי שאשא כהן, שמעון שראל.

**אישה חדשה (200):** קרן אטיאס בובליל, חלי הולצמן, אוסנת זוהר זני,
אלמז זרו, הדר מוכתר*, סמדר מורס*, סילבה מזרחי, חיה מלול גז, נורית מנחם,
מרה מרו סנבטו, נועה שושן ברסקין, איריס שטגמן, סמדר הילה שמואלי, אתי תלמי.

The national slate is dominated by sitting MKs and ministers; the district
slates mix municipal figures, activists, and public personalities
(e.g. גרשון מסיקה — former Samaria regional council head; ארז תדמור — Im
Tirtzu co-founder and publicist; אפי נוה — former Bar Association head;
הדר מוכתר — journalist/activist). The sector slates are mostly first-time
national candidates.

## How Likud voters differ from הדמוקרטים voters — method implications

The הדמוקרטים method transfers, but the discriminators are entirely
different. In Likud, the following are **near-consensus and therefore poor
rankers** (keep out of the scalar axes):

- Right-wing identity; opposition to a Palestinian state; hawkish security.
- Support for Netanyahu **as leader** — he is unopposed. (Loyalty *style* is
  a different, live question — see below.)
- Support for *some* judicial reform in principle.

What actually splits the membership and the candidates, per polling of Likud
members/voters (Smith Institute member poll, Feb 2026; Israel Hayom "Hayom"
polls, 2025–26) and campaign reporting:

### 1. The haredi draft law and the price of the haredi alliance ★ strongest

The clearest measured fault line. A majority of Likud **members** supports an
equal-burden draft framework *even at the cost of a coalition crisis* with
the haredi parties; the Smith poll found members will judge primaries
candidates partly by their draft-law stance. Among Likud **voters**: only 17%
back the haredi alliance unconditionally, 57% condition it on draft
compromises, 22% want out of haredi dependence altogether. Named
broad-draft camp among candidates: קיש, גמליאל, חיים כץ, אלקין, ביטן, דלל,
דנינו (also אדלשטיין, אילוז — who left/are outside the list). Loyalist camp
prioritizes coalition integrity. **This is a scalar axis.**

### 2. Coalition horizon: right-only vs. broad/unity government

48% of Likud voters prefer a unity government vs. 35% who want another
right-haredi coalition; members lean more right-only than voters. Netanyahu
himself reportedly wants to "moderate the list" to win back voters lost
toward the center. Candidates split visibly on this. **Scalar axis** —
partially correlated with #1; watch for merge, as with
`separation_annexation` in the Democrats space.

### 3. Continuing the judicial overhaul

Central campaign issue nationally. Within Likud: maximalists who want to
finish the reform (לוין, קרעי, and much of the national slate's vocal wing —
גוטליב, קלנר) vs. those who want it paused, softened, or done only in broad
agreement. **Scalar axis.**

### 4. State commission of inquiry into October 7

The coalition is advancing a government-appointed ("political") commission
instead of a state commission under the Supreme Court; some Likud figures
say a state commission is inevitable, others call it a legal-system ambush.
Member polling shows genuine internal division. **Scalar or agree/disagree
axis** (like the Democrats' `separation_annexation`, a binary stance).

### 5. West Bank sovereignty — now vs. coordinated

Members' polling shows a large majority **against** applying sovereignty
now *if it means a clash with the Trump administration* — while a vocal
candidate camp (בוארון, הלוי, ואטורי; district figures like מסיקה) pushes
immediate annexation. The split is about **timing and price, not principle**
— the axis must be worded that way. **Scalar axis.**

### 6. Gaza endgame

Permanent military control and renewed Jewish settlement in Gaza
(ואטורי and others) vs. security control without settlement / deal-oriented
pragmatism. Distinct from #5 in who it splits. **Candidate scalar; verify
discrimination in Step 2 scoring.**

### 7. Economy and cost of living

29% of Likud voters name the economy a top concern (second only to societal
polarization at 30%). Likud's platform is free-market, but the list spans
Thatcherite liberals (ברקת) to sectoral/welfare populists (many district
candidates; ביטן's workers' blocs). Also the classic **periphery vs. center**
investment question — the Negev/Galilee/development-town identity is core
Likud. **Scalar axis (free market ↔ state intervention), plus a flagship
option for periphery.**

### 8. Loyalty style: leader's line vs. independent voice

Not an ideology axis but a real ranking criterion for Likud members:
candidates run explicitly as "fighters for Bibi" (אמסלם, גולן, זוהר) or as
independent-minded (ביטן — who fought Netanyahu over the primaries system
itself; גוטליב — running against the party machine; סעדה — clashed with the
leadership over the state attorney). Members reward both archetypes.
**Candidate:** could be a scalar (`leader_line`: full alignment ↔
independent voice) — it discriminates well and voters genuinely differ.
**Risk:** defamation-adjacent scoring, like the dropped `honesty` valence in
the Democrats space; must be worded as *style preference*, not virtue.
**Flag for Step 1 discussion.**

### 9. Candidate-quality valences

- `experience` (ministerial/parliamentary record) — transfers as-is from the
  Democrats space; opt-in importance, since "fresh outsider" is a live
  preference in this primary (sector slates are full of newcomers).
- `activism` (parliamentary work rate / constituent service) — Likud members
  visibly reward "doers"; possible second valence. Verify measurability
  (Knesset activity data is public) before adopting.

### Deliberately out (near-consensus or out of scope)

- Netanyahu's leadership itself — unopposed, not a ranker.
- Opposition to a Palestinian state / two-state axis — near-consensus here
  (unlike the Democrats' `conflict` axis, which was their sharpest).
- Religion & state *broadly* (kashrut, transit on Shabbat) — Likud members
  are mostly traditionalist-status-quo; the live intra-party question is the
  draft (#1). A wide religion-state axis would double-count it. Revisit if
  Step 2 shows candidates actually spread.
- The deal/bloc machinery — real, but not an issue space.

## Draft parameter sketch (for Step 1 discussion — NOT approved)

| id (draft) | kind | Pole low (0) | Pole high (1) |
|---|---|---|---|
| `haredi_draft` | scalar | Preserve the haredi alliance | Equal draft even at coalition cost |
| `coalition_breadth` | scalar | Right-wing coalition only | Broad/unity government |
| `judicial_reform` | scalar | Pause / broad-agreement only | Complete the overhaul |
| `oct7_inquiry` | scalar (agree/disagree) | Government-appointed commission | Full state commission of inquiry |
| `sovereignty` | scalar | Coordinate with Washington, wait | Apply sovereignty now |
| `gaza_endgame` | scalar | Security control, no settlement | Permanent control + resettlement |
| `economy` | scalar | Free market | State investment / social safety net |
| `leader_line` | scalar (flagged) | Independent voice | Full alignment with the leader |
| `experience` | valence | — | Senior public record |
| `flagship` | set | — | see options below |

Draft `flagship` options: `cost_of_living`, `personal_security_crime`,
`periphery_negev_galilee`, `haredi_draft_equality`, `judicial_reform`,
`settlement_sovereignty`, `oct7_inquiry_hostages`, `aliyah_absorption`,
`young_housing`. (Sector slates suggest aliyah, disability rights, and
women's representation matter to defined member groups — candidates for
flagship options, not axes.)

Merge-watch pairs (same worldview risk, as flagged for the Democrats space):
`haredi_draft`×`coalition_breadth`, `sovereignty`×`gaza_endgame`,
`judicial_reform`×`oct7_inquiry`. Step 2 scoring against real positions
decides.

## Next steps

1. **Step 1 — approve the parameter space.** Resolve the flagged items
   (`leader_line`, `oct7_inquiry` shape, second valence, ballot-structure
   grouping) and freeze ids.
2. **Step 2 — candidate positions + evidence.** Per-candidate sourcing under
   the [`candidate-scoring.md`](candidate-scoring.md) methodology: Knesset
   votes (draft-law bills, override clause), floor speeches, interviews and
   campaign material. 100+ candidates is far beyond the Democrats' 51 —
   consider scoping v1 to the national slate + district slates, with sector
   slates added incrementally; the engine already tolerates missing
   positions.
3. **Event scaffolding.** `likud-2026` under `src/data/events/` per
   [`multi-event.md`](multi-event.md); locale strings for every id in both
   he/en.

## Sources

- Official Likud candidate PDFs (rosters above), likud.org.il primaries
  pages (schedule, eligibility).
- Israel Hayom — Likud voter poll on the haredi partnership and draft
  conditions; Likud member poll on draft vs. elections; poll on an Oct-7
  state commission.
- Smith Institute member poll (Feb 2026) — draft-law stance as a primaries
  voting consideration; named broad-draft candidate camp; sovereignty-timing
  majority (via Israel Hayom / Walla reporting).
- Ynet — "כולם נגד כולם" primaries report (deals, blocs, free voters,
  Netanyahu's list-moderation aim, Gottlieb campaign); state-commission
  coverage.
- Mako/N12 — reserved-slots arrangement; C14 — primaries timeline.
- Wikipedia (he) — הבחירות לכנסת ה-26 background.
