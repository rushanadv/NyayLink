/**
 * NyayLink Context-Sensitive Procedural Filing Checklists
 * Grounded in statutory procedural codes and court registry practices.
 * Distinguishes general document preparation from court-specific directives.
 */

export interface ChecklistItem {
  id: string;
  labelEn: string;
  labelHi: string;
  descriptionEn: string;
  descriptionHi: string;
  isRequired: boolean;
  statutorySource: string;
  documentType: "pleading" | "affidavit" | "evidence" | "court_fee" | "vakalatnama";
}

export interface ProceduralChecklist {
  id: string;
  titleEn: string;
  titleHi: string;
  forum: string;
  governingProcedure: string;
  jurisdictionScope: "National Standard" | "State/Tribunal Specific";
  guidanceDisclaimer: string;
  items: ChecklistItem[];
}

export const PROCEDURAL_CHECKLISTS: ProceduralChecklist[] = [
  {
    id: "bnss-bail-application",
    titleEn: "Bail Application Preparation (Sections 480 / 482 BNSS, 2023)",
    titleHi: "जमानत आवेदन तैयारी (धारा 480 / 482 बीएनएसएस, 2023)",
    forum: "Sessions Court / High Court / Magistrate",
    governingProcedure: "Bharatiya Nagarik Suraksha Sanhita, 2023 & State High Court Criminal Rules of Practice",
    jurisdictionScope: "National Standard",
    guidanceDisclaimer:
      "General preparation guidance. Specific High Courts and Sessions Benches may mandate additional registry forms, certified copy requirements, or local indexing styles.",
    items: [
      {
        id: "fir-copy",
        labelEn: "Certified Copy or True Copy of FIR / e-FIR",
        labelHi: "प्राथमिकी (FIR) की प्रमाणित या सत्यापित प्रति",
        descriptionEn: "Complete First Information Report registered under Section 173 BNSS with all named sections.",
        descriptionHi: "धारा 173 बीएनएसएस के तहत दर्ज प्राथमिकी की पूर्ण प्रति।",
        isRequired: true,
        statutorySource: "Section 173 BNSS, 2023",
        documentType: "pleading",
      },
      {
        id: "vakalatnama-memo",
        labelEn: "Executed Vakalatnama / Memo of Appearance",
        labelHi: "हस्ताक्षरित वकालतनामा / मेमो",
        descriptionEn: "Signed by the accused (or applicant/relative if accused is in judicial custody) with Advocate Welfare Stamp.",
        descriptionHi: "अभियुक्त अथवा अधिकृत परिजन द्वारा हस्ताक्षरित व बार वेलफेयर स्टैम्प संलग्न।",
        isRequired: true,
        statutorySource: "Section 30, Advocates Act, 1961",
        documentType: "vakalatnama",
      },
      {
        id: "grounds-grounds",
        labelEn: "Grounds for Bail with Clean Criminal Antecedents Affidavit",
        labelHi: "जमानत के आधार व पूर्व आपराधिक इतिहास रहित शपथपत्र",
        descriptionEn: "Affidavit detailing personal liberty grounds, medical urgency, family dependency, and lack of flight risk.",
        descriptionHi: "व्यक्तिगत स्वतंत्रता, स्वास्थ्य व साक्षी प्रभावित न करने का शपथपत्र।",
        isRequired: true,
        statutorySource: "Section 480 / 482 BNSS, 2023",
        documentType: "affidavit",
      },
      {
        id: "surety-solvency",
        labelEn: "Proposed Local Surety Details & Identity Proofs",
        labelHi: "स्थानीय जामिनदार (Surety) का पहचान व पते का प्रमाण",
        descriptionEn: "Aadhaar, Voter ID, and solvency/property proof of solvent local sureties.",
        descriptionHi: "स्थानीय जामिनदार का आधार/पहचान व संपत्ति साक्ष्य।",
        isRequired: false,
        statutorySource: "Section 488 BNSS, 2023",
        documentType: "evidence",
      },
      {
        id: "rejection-order",
        labelEn: "Certified Copy of Lower Court Rejection Order (if appeal/subsequent bail)",
        labelHi: "निचली अदालत के अस्वीकृति आदेश की प्रमाणित प्रति (यदि लागू हो)",
        descriptionEn: "Mandatory if applying before Sessions Court or High Court after Magistrate rejection.",
        descriptionHi: "सत्र या उच्च न्यायालय में आवेदन हेतु मजिस्ट्रेट के आदेश की प्रति आवश्यक है।",
        isRequired: false,
        statutorySource: "High Court Criminal Rules of Practice",
        documentType: "pleading",
      },
    ],
  },
  {
    id: "cpa-consumer-complaint",
    titleEn: "Consumer Complaint Filing (District Consumer Commission - DCDRC)",
    titleHi: "उपभोक्ता शिकायत दाखिला (जिला उपभोक्ता आयोग - DCDRC)",
    forum: "District Consumer Disputes Redressal Commission / e-Daakhil",
    governingProcedure: "Consumer Protection Act, 2019 & Consumer Protection (Consumer Commission Procedure) Regulations, 2020",
    jurisdictionScope: "National Standard",
    guidanceDisclaimer:
      "Complaints up to ₹50 Lakhs fall within District Commission pecuniary jurisdiction. Electronic filing through e-Daakhil portal is recognized nationwide.",
    items: [
      {
        id: "index-memo",
        labelEn: "Index, Memo of Parties & Verification Clause",
        labelHi: "इंडेक्स, पक्षकारों का विवरण व सत्यापन खंड",
        descriptionEn: "Full contact details, email addresses, and registered addresses of complainant and opposite party.",
        descriptionHi: "शिकायतकर्ता व विपक्षी का पूर्ण पता, ईमेल व फोन विवरण।",
        isRequired: true,
        statutorySource: "Section 35 CPA 2019",
        documentType: "pleading",
      },
      {
        id: "receipt-invoice",
        labelEn: "Tax Invoice, Proof of Purchase & Payment Receipts",
        labelHi: "टैक्स इनवॉइस, खरीद व भुगतान की रसीदें",
        descriptionEn: "Conclusive evidentiary proof establishing consumer relationship under Section 2(7) CPA.",
        descriptionHi: "उपभोक्ता संबंध सिद्ध करने वाला पक्का बिल व बैंक ट्रांजेक्शन रिकॉर्ड।",
        isRequired: true,
        statutorySource: "Section 2(7) CPA 2019",
        documentType: "evidence",
      },
      {
        id: "legal-notice-replies",
        labelEn: "Copy of Pre-Litigation Legal Notice & Courier Tracking / Email",
        labelHi: "पूर्व कानूनी नोटिस, डाक रसीद व विपक्षी का उत्तर",
        descriptionEn: "Statutory communication giving the opposite party opportunity to rectify the deficiency in service.",
        descriptionHi: "विपक्षी को सेवा में कमी सुधारने हेतु दिया गया लिखित नोटिस।",
        isRequired: true,
        statutorySource: "Regulation 4, Consumer Protection Regulations 2020",
        documentType: "evidence",
      },
      {
        id: "prescribed-fee",
        labelEn: "Exemption or Prescribed Consumer Court Fee Receipt",
        labelHi: "उपभोक्ता न्यायालय शुल्क रसीद (₹5 लाख तक निःशुल्क)",
        descriptionEn: "Complaints up to ₹5 Lakhs require nil court fee; fee increases on sliding scale above ₹5 Lakhs.",
        descriptionHi: "₹5 लाख तक के दावों पर कोई शुल्क नहीं लगता।",
        isRequired: true,
        statutorySource: "Rule 7, Consumer Protection (Fee) Rules",
        documentType: "court_fee",
      },
      {
        id: "expert-opinion",
        labelEn: "Technical / Laboratory Expert Opinion (if manufacturing defect)",
        labelHi: "तकनीकी विशेषज्ञ की रिपोर्ट (यदि विनिर्माण दोष हो)",
        descriptionEn: "Government-approved laboratory analysis if alleging inherent defect in machinery or goods.",
        descriptionHi: "मशीनरी अथवा उत्पाद में तकनीकी दोष की प्रमाणित लैब रिपोर्ट।",
        isRequired: false,
        statutorySource: "Section 38(2)(c) CPA 2019",
        documentType: "evidence",
      },
    ],
  },
  {
    id: "rera-complaint-form-m",
    titleEn: "RERA Complaint for Delayed Possession & Refund (Form M)",
    titleHi: "रेरा शिकायत: विलंबित कब्जा व धनवापसी (फ़ॉर्म M)",
    forum: "State Real Estate Regulatory Authority (RERA)",
    governingProcedure: "Real Estate (Regulation and Development) Act, 2016 & Respective State RERA Rules",
    jurisdictionScope: "State/Tribunal Specific",
    guidanceDisclaimer:
      "Allottee complaints are submitted online via the respective State RERA web portal (e.g., MahaRERA, HRERA, UP-RERA, Delhi RERA).",
    items: [
      {
        id: "builder-buyer-agreement",
        labelEn: "Registered / Executed Builder-Buyer Agreement (BBA) / Allotment Letter",
        labelHi: "पंजीकृत बिल्डर-बायर एग्रीमेंट या आवंटन पत्र",
        descriptionEn: "Must clearly display the committed possession date, grace period clauses, and unit number.",
        descriptionHi: "कब्जे की तय तिथि, ग्रेस पीरियड व फ्लैट संख्या प्रदर्शित करने वाला अनुबंध।",
        isRequired: true,
        statutorySource: "Section 13 & 18 RERA 2016",
        documentType: "pleading",
      },
      {
        id: "payment-ledger",
        labelEn: "Comprehensive Bank Statements & Builder Payment Receipts",
        labelHi: "बैंक स्टेटमेंट व बिल्डर द्वारा जारी भुगतान रसीदें",
        descriptionEn: "Chronological ledger proving total consideration paid by allottee to date.",
        descriptionHi: "आवंटिती द्वारा अब तक जमा की गई कुल राशि का बैंक प्रमाणित विवरण।",
        isRequired: true,
        statutorySource: "Section 18(1) RERA 2016",
        documentType: "evidence",
      },
      {
        id: "state-portal-fee",
        labelEn: "State RERA Online Filing Fee Receipt (usually ₹1,000 to ₹5,000)",
        labelHi: "राज्य रेरा ऑनलाइन दाखिला शुल्क रसीद",
        descriptionEn: "Statutory complaint fee as prescribed in State RERA regulations.",
        descriptionHi: "विभागीय पोर्टल पर जमा किया गया निर्धारित सरकारी शुल्क।",
        isRequired: true,
        statutorySource: "State RERA Procedural Rules",
        documentType: "court_fee",
      },
      {
        id: "site-photographs",
        labelEn: "Photographs / Geo-tagged Evidence of Incomplete Construction",
        labelHi: "अधूरे निर्माण के जियो-टैग्ड फोटोग्राफ्स व साक्ष्य",
        descriptionEn: "Photographic proof substantiating that the project lacks occupancy certificate or is stalled.",
        descriptionHi: "प्रोजेक्ट का कार्य रुका होने व ओसी (OC) न मिलने का सचित्र प्रमाण।",
        isRequired: false,
        statutorySource: "Section 35 RERA 2016",
        documentType: "evidence",
      },
    ],
  },
  {
    id: "cpc-civil-injunction",
    titleEn: "Civil Suit for Permanent & Temporary Injunction",
    titleHi: "स्थायी व अस्थायी निषेधाज्ञा (Injunction) दीवानी वाद",
    forum: "Civil Judge (Junior / Senior Division) / Commercial Court",
    governingProcedure: "Code of Civil Procedure, 1908 (Order XXXIX Rules 1 & 2)",
    jurisdictionScope: "National Standard",
    guidanceDisclaimer:
      "Applicant must satisfy three cardinal tests: (1) Prima Facie Case, (2) Balance of Convenience, and (3) Irreparable Loss/Injury.",
    items: [
      {
        id: "plaint-verified",
        labelEn: "Verified Plaint with Title Documents & Site Plan",
        labelHi: "सत्यापित वाद पत्र, मालिकाना हक के दस्तावेज़ व नक्शा",
        descriptionEn: "Comprehensive pleading setting out clear chain of title, continuous possession, and threatened interference.",
        descriptionHi: "संपत्ति का नक्शा, म्यूटेशन रिकॉर्ड व अवैध बेदखली की आशंका का विवरण।",
        isRequired: true,
        statutorySource: "Order VII Rule 1 & Order XXXIX CPC",
        documentType: "pleading",
      },
      {
        id: "interim-application",
        labelEn: "Application under Order XXXIX Rules 1 & 2 CPC for Ex-Parte Stay",
        labelHi: "ऑर्डर 39 नियम 1 व 2 सीपीसी के तहत स्थगन प्रार्थना पत्र",
        descriptionEn: "Supported by affidavit demonstrating urgent threat of demolition, alienation, or illegal dispossession.",
        descriptionHi: "तत्काल अंतरिम रोक लगाने हेतु शपथपत्र युक्त प्रार्थना पत्र।",
        isRequired: true,
        statutorySource: "Order XXXIX Rules 1 & 2 CPC",
        documentType: "affidavit",
      },
      {
        id: "revenue-records",
        labelEn: "Revenue Records (Jamabandi / Khasra / Khatoni / Property Tax)",
        labelHi: "राजस्व रिकॉर्ड (जमाबंदी / खसरा / खतौनी / हाउस टैक्स रसीद)",
        descriptionEn: "Official municipal or revenue records substantiating settled possession and ownership.",
        descriptionHi: "तहसील या नगर निगम द्वारा जारी वैध दखल व स्वामित्व रिकॉर्ड।",
        isRequired: true,
        statutorySource: "Section 38, Specific Relief Act, 1963",
        documentType: "evidence",
      },
      {
        id: "court-fee-suit",
        labelEn: "Court Fee as per State Court Fees Act Valuation",
        labelHi: "राज्य कोर्ट फीस अधिनियम के अनुसार स्टैम्प शुल्क",
        descriptionEn: "Fixed court fee for injunction or ad-valorem fee depending on State amendments.",
        descriptionHi: "राज्य सरकार द्वारा निर्धारित दीवानी कोर्ट फीस।",
        isRequired: true,
        statutorySource: "Court Fees Act, 1870 (State Schedule)",
        documentType: "court_fee",
      },
    ],
  },
];
