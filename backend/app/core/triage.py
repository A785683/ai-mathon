from typing import Dict, Any

TRIAGE_GUIDELINES = {
    0: {
        "grade_code": "Grade 0",
        "title_en": "No Apparent Diabetic Retinopathy",
        "title_hi": "कोई डायबिटिक रेटिनोपैथी नहीं पाई गई",
        "urgency": "ROUTINE",
        "urgency_label_en": "Routine Annual Screening",
        "urgency_label_hi": "नियमित वार्षिक जांच",
        "clinical_findings_en": "No microaneurysms, hemorrhages, or exudates observed. Retinal vasculature appears normal.",
        "clinical_findings_hi": "रेटिना में कोई माइक्रोएन्यूरिज्म, रक्तस्राव या रिसाव नहीं देखा गया। रक्त वाहिकाएं सामान्य हैं।",
        "action_en": "Schedule routine annual dilated retinal examination. Continue optimal glycemic, lipid, and blood pressure control.",
        "action_hi": "अगले 1 वर्ष में नियमित नेत्र जांच कराएं। ब्लड शुगर और रक्तचाप को नियंत्रित रखें।"
    },
    1: {
        "grade_code": "Grade 1",
        "title_en": "Mild Non-Proliferative Diabetic Retinopathy (NPDR)",
        "title_hi": "हल्का गैर-प्रोलिफेरेटिव डायबिटिक रेटिनोपैथी",
        "urgency": "ROUTINE",
        "urgency_label_en": "Routine Follow-up (9-12 Months)",
        "urgency_label_hi": "नियमित अनुवर्ती जांच (9-12 माह)",
        "clinical_findings_en": "Isolated microaneurysms detected without significant retinal exudates or edema.",
        "clinical_findings_hi": "केवल प्रारंभिक माइक्रोएन्यूरिज्म (सूक्ष्म उभार) पाए गए हैं। गंभीर क्षति नहीं है।",
        "action_en": "Rescreen within 9 to 12 months. Strict monitoring of HbA1c, blood pressure, and cholesterol.",
        "action_hi": "9 से 12 महीने में दोबारा जांच कराएं। खान-पान और दवाओं से शुगर लेवल नियंत्रित रखें।"
    },
    2: {
        "grade_code": "Grade 2",
        "title_en": "Moderate Non-Proliferative Diabetic Retinopathy (NPDR)",
        "title_hi": "मध्यम गैर-प्रोलिफेरेटिव डायबिटिक रेटिनोपैथी",
        "urgency": "NON_URGENT",
        "urgency_label_en": "Non-Urgent Specialist Referral (4-6 Weeks)",
        "urgency_label_hi": "नेत्र विशेषज्ञ परामर्श (4-6 सप्ताह)",
        "clinical_findings_en": "Multiple microaneurysms, dot/blot hemorrhages, and/or hard exudates detected in retinal quadrants.",
        "clinical_findings_hi": "रेटिना में छोटे रक्तस्राव और पीले धब्बे (एक्सयूडेट्स) मौजूद हैं। दृष्टि हानि का जोखिम बढ़ रहा है।",
        "action_en": "Refer to an ophthalmologist within 4 to 6 weeks for optical coherence tomography (OCT) and macula assessment.",
        "action_hi": "4 से 6 सप्ताह के भीतर किसी नेत्र विशेषज्ञ (ऑप्थल्मोलॉजिस्ट) को दिखाकर विस्तृत जांच कराएं।"
    },
    3: {
        "grade_code": "Grade 3",
        "title_en": "Severe Non-Proliferative Diabetic Retinopathy (NPDR)",
        "title_hi": "गंभीर गैर-प्रोलिफेरेटिव डायबिटिक रेटिनोपैथी",
        "urgency": "URGENT",
        "urgency_label_en": "Urgent Specialist Referral (1-2 Weeks)",
        "urgency_label_hi": "त्वरित विशेषज्ञ परामर्श (1-2 सप्ताह)",
        "clinical_findings_en": "Extensive intraretinal hemorrhages in multiple quadrants, venous beading, or IRMA (4-2-1 rule met). High risk of progression.",
        "clinical_findings_hi": "रेटिना के कई हिस्सों में गंभीर रक्तस्राव और शिरा संबंधी असामान्यताएं। दृष्टि को तत्काल खतरा।",
        "action_en": "Urgent retinal specialist referral within 1 to 2 weeks. Comprehensive evaluation for macular edema and panretinal treatment.",
        "action_hi": "1 से 2 सप्ताह में तुरंत रेटिना स्पेशलिस्ट को दिखाएं। समय पर उपचार से दृष्टि बचाई जा सकती है।"
    },
    4: {
        "grade_code": "Grade 4",
        "title_en": "Proliferative Diabetic Retinopathy (PDR)",
        "title_hi": "प्रोलिफेरेटिव डायबिटिक रेटिनोपैथी (उच्च जोखिम)",
        "urgency": "CRITICAL",
        "urgency_label_en": "Immediate Emergency Referral (< 72 Hours)",
        "urgency_label_hi": "तत्काल आपातकालीन परामर्श (72 घंटे के भीतर)",
        "clinical_findings_en": "Neovascularization (new abnormal fragile blood vessels) on disc or elsewhere, preretinal/vitreous hemorrhage.",
        "clinical_findings_hi": "नई असामान्य रक्त वाहिकाओं का निर्माण और गंभीर रक्तस्राव। स्थायी दृष्टिहीनता का तीव्र जोखिम।",
        "action_en": "Immediate hospital/retina specialist referral within 48 to 72 hours. Urgent intervention (anti-VEGF injections or laser photocoagulation).",
        "action_hi": "बिना देरी किए तुरंत बड़े नेत्र अस्पताल या रेटिना विशेषज्ञ से संपर्क करें। आपातकालीन लेजर/इंजेक्शन की आवश्यकता हो सकती है।"
    }
}

def get_triage_info(grade: int) -> Dict[str, Any]:
    grade = max(0, min(4, int(grade)))
    return TRIAGE_GUIDELINES.get(grade, TRIAGE_GUIDELINES[0])

