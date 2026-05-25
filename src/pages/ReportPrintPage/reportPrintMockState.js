/** Default payload for /report-print when opened without route state. */
export const REPORT_PRINT_MOCK_STATE = {
  phValue: 4.72,
  phLevel: "Slightly Elevated",
  timestamp: "21 May 2026, 14:32",
  interpretation:
    "Your pH is slightly elevated. This can be normal around your period or with hormonal shifts.",
  overview:
    "Your microbiome looks mostly balanced. Lactobacillus help maintain protective acidity. " +
    "A slightly higher pH may reflect temporary changes rather than infection. " +
    "If symptoms persist, consider discussing results with your healthcare provider.",
  recommendations: [
    "**Hydration** supports mucosal health. Aim for regular fluid intake unless your clinician advises otherwise.",
    "Avoid **douching** or harsh soaps in the vulvovaginal area; they can disrupt the microbiome.",
    "Track symptoms over the next few days. Note discharge, odor, or irritation in your journal [1].",
    "This report is for wellness education only and does not replace medical diagnosis or treatment.",
  ],
  citations: [
    {
      title:
        "Vaginal pH: a simple assessment highly correlated with vaginal morphology and symptoms in postmenopausal women",
      reference_citation:
        "Panda S, Das A, Singh AS, Pala S. Menopause. 2018 Jul;25(7):762-6.",
      doi_url: "https://doi.org/10.1097/GME.0000000000001053",
    },
    {
      title: "Correlation of vaginal pH with FSH levels in menopause.",
      reference_citation:
        "Kaur DK, Kaur DSP, Kaur DP, Bedi DGK, Kaur DH, Kaur DA. International Journal of Clinical Obstetrics and Gynaecology. 2019;3(4):107-10.",
      doi_url: "https://doi.org/10.22271/2394-2124",
    },
    {
      title:
        "Relation between vaginal and endocervical pH in pre- and post-menopausal women.",
      reference_citation:
        "Murta EF, Filho AC, Barcelos AC. Arch Gynecol Obstet. 2005 Sep;272(3):211-3.",
      doi_url: "https://doi.org/10.1007/s00404-005-0752-5",
    },
  ],
  age: "32",
  lifeStage: ["Trying to conceive"],
  ethnicBackground: ["White", "Hispanic or Latino"],
  menstrualCycle: ["Regular cycle"],
  hormoneDiagnoses: ["PCOS"],
  currentMedications: ["Metformin"],
  birthControl: {
    general: "Oral contraceptive pill",
    pill: "Combined pill",
  },
  hormoneTherapy: {
    general: "None",
    hormoneReplacement: [],
  },
  fertilityJourney: {
    currentStatus: "Actively trying",
    fertilityTreatments: ["Ovulation induction"],
  },
  discharge: ["Clear or white", "Slightly increased"],
  vulvaCondition: ["Mild irritation"],
  smell: ["None"],
  urination: ["Normal"],
  notes:
    "Mild itching for two days after period ended. No pain. Using new cotton underwear.",
};
