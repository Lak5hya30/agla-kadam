/**
 * Lightweight bilingual dictionary (§25).
 *
 * English + simple Hindi. AI content (summaries) carries its own Hindi
 * from the analysis; this dictionary covers UI chrome. Kept as a plain
 * object for zero-dependency, low-bandwidth i18n.
 */
export type Lang = "en" | "hi";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
];

type Dict = Record<string, { en: string; hi: string }>;

export const STRINGS: Dict = {
  "app.name": { en: "Agla Kadam", hi: "अगला कदम" },
  "app.subtitle": {
    en: "Understand the response. Know your next step.",
    hi: "जवाब समझें। अपना अगला कदम जानें।",
  },
  "header.companion": {
    en: "Citizen companion for CPGRAMS grievance responses",
    hi: "CPGRAMS शिकायत के जवाब समझने में मदद करने वाला साथी",
  },
  "header.independent": {
    en: "Independent demo · Not affiliated with CPGRAMS",
    hi: "स्वतंत्र डेमो · CPGRAMS से संबद्ध नहीं",
  },
  "nav.home": { en: "Home", hi: "होम" },
  "nav.demos": { en: "Demo cases", hi: "डेमो केस" },
  "nav.whatsReal": { en: "What’s real?", hi: "क्या असली है?" },
  "app.disclaimer": {
    en: "Hackathon demo using synthetic grievance data. Not affiliated with CPGRAMS or the Government of India.",
    hi: "यह एक हैकाथॉन डेमो है जो काल्पनिक (सिंथेटिक) डेटा का उपयोग करता है। इसका CPGRAMS या भारत सरकार से कोई संबंध नहीं है।",
  },
  "home.hero1": { en: "Your grievance says “Disposed.”", hi: "आपकी शिकायत का दर्जा “निस्तारित” है।" },
  "home.hero2": {
    en: "Let’s check what was actually resolved.",
    hi: "आइए देखें कि आपकी कौन-सी माँग सच में पूरी हुई।",
  },
  "home.support": {
    en: "Agla Kadam compares your request with the department’s response and explains what you can safely do next.",
    hi: "अगला कदम आपकी माँग और विभाग के जवाब को आमने-सामने रखकर बताता है कि क्या बाकी है और आगे क्या किया जा सकता है।",
  },
  "home.cta": { en: "Try a demo case", hi: "एक डेमो केस आज़माएँ" },
  "home.how": { en: "How it works", hi: "यह कैसे काम करता है" },
  "trust.synthetic": { en: "Synthetic data only", hi: "केवल काल्पनिक डेटा" },
  "trust.nologin": { en: "No CPGRAMS login", hi: "कोई CPGRAMS लॉगिन नहीं" },
  "trust.noapi": { en: "No government APIs", hi: "कोई सरकारी API नहीं" },
  "trust.nopersonal": { en: "No personal information required", hi: "कोई निजी जानकारी नहीं चाहिए" },
  "demo.title": { en: "Choose a demo case", hi: "एक डेमो केस चुनें" },
  "demo.subtitle": {
    en: "Each case shows a different kind of department response.",
    hi: "हर मामले में विभाग के जवाब की एक अलग स्थिति दिखाई गई है।",
  },
  "case.status": { en: "Status", hi: "स्थिति" },
  "case.disposed": { en: "Disposed", hi: "निस्तारित" },
  "case.grievance": { en: "Your grievance", hi: "आपकी शिकायत" },
  "case.response": { en: "Department response", hi: "विभाग का जवाब" },
  "case.submitted": { en: "Submitted", hi: "दर्ज की गई" },
  "case.received": { en: "Response received", hi: "जवाब मिला" },
  "case.check": { en: "Check my resolution", hi: "देखें, क्या हल हुआ" },
  "analysis.title": { en: "What you asked vs what they answered", hi: "आपकी माँग और विभाग के जवाब की तुलना" },
  "analysis.checking": { en: "Comparing your request with the response…", hi: "आपकी माँग और विभाग के जवाब की तुलना हो रही है…" },
  "analysis.youAsked": { en: "You asked", hi: "आपकी माँग" },
  "analysis.theySaid": { en: "Department said", hi: "विभाग ने कहा" },
  "analysis.assessment": { en: "Assessment", hi: "आकलन" },
  "analysis.why": { en: "Why", hi: "क्यों" },
  "analysis.showWhere": { en: "Show me where", hi: "जवाब में कहाँ लिखा है?" },
  "analysis.showRequest": { en: "Show original request", hi: "मूल माँग दिखाएँ" },
  "analysis.hideEvidence": { en: "Hide evidence", hi: "प्रमाण छिपाएँ" },
  "analysis.noMatch": { en: "No matching response found", hi: "कोई मेल खाता जवाब नहीं मिला" },
  "analysis.tally": { en: "Summary", hi: "सारांश" },
  "analysis.headAddressed": { en: "Your request appears to have been addressed.", hi: "जवाब से लगता है कि आपकी माँग पूरी हो गई है।" },
  "analysis.headPartial": { en: "Marked disposed, but the response does not fully confirm the outcome.", hi: "शिकायत निस्तारित दिखाई गई है, पर जवाब से पूरा नतीजा साफ़ नहीं होता।" },
  "analysis.error": { en: "We could not run the analysis just now. Please try again.", hi: "हम अभी विश्लेषण नहीं चला सके। कृपया फिर से कोशिश करें।" },
  "analysis.tryAgain": { en: "Try again", hi: "फिर कोशिश करें" },
  "common.offline": { en: "Offline comparison", hi: "ऑफ़लाइन तुलना" },
  "status.addressed": { en: "Addressed", hi: "माँग पूरी" },
  "status.partial": { en: "Partly addressed", hi: "कुछ हद तक पूरी" },
  "status.not_addressed": { en: "Not addressed", hi: "जवाब नहीं मिला" },
  "status.unclear": { en: "Unclear", hi: "स्पष्ट नहीं" },
  "status.caution": { en: "Please review the original text.", hi: "कृपया मूल पाठ जाँच लें।" },
  "next.question": { en: "Is your problem actually resolved?", hi: "क्या आपकी समस्या वास्तव में हल हो गई?" },
  "next.yes": { en: "Yes, this solved my problem", hi: "हाँ, इससे मेरी समस्या हल हो गई" },
  "next.no": { en: "No, something is still unresolved", hi: "नहीं, कुछ अभी भी अनसुलझा है" },
  "next.resolvedTitle": { en: "Great — no further action needed", hi: "बढ़िया — अब कुछ करने की ज़रूरत नहीं" },
  "next.resolvedBody": {
    en: "You indicated the response solved your problem. In this demo, the journey is complete.",
    hi: "आपके अनुसार विभाग के जवाब से समस्या हल हो गई है। इसलिए इस डेमो में आगे कोई कार्रवाई ज़रूरी नहीं है।",
  },
  "next.whatNext": { en: "What can you do next?", hi: "आप आगे क्या कर सकते हैं?" },
  "next.giveFeedback": { en: "Give feedback", hi: "प्रतिक्रिया दें" },
  "next.seeOptions": { en: "See available options", hi: "उपलब्ध विकल्प देखें" },
  "next.aiNote": {
    en: "AI does not decide whether you can appeal — that comes from deterministic policy rules.",
    hi: "AI यह तय नहीं करता कि आप अपील कर सकते हैं या नहीं — यह निश्चित नियमों से तय होता है।",
  },
  "guard.analysisFirst": { en: "Please run the resolution analysis first.", hi: "आगे बढ़ने से पहले शिकायत और जवाब की तुलना करें।" },
  "guard.appealFirst": { en: "Please prepare your appeal first.", hi: "आगे बढ़ने से पहले अपील का मसौदा तैयार करें।" },
  "guard.noAppeal": { en: "No demo appeal has been submitted yet.", hi: "अभी तक कोई डेमो अपील जमा नहीं हुई है।" },
  "guard.noTracking": { en: "No demo appeal to track yet.", hi: "ट्रैक करने के लिए अभी कोई डेमो अपील नहीं है।" },
  "track.current": { en: "Current stage", hi: "मौजूदा स्थिति" },
  "appeal.original": { en: "Original grievance", hi: "मूल शिकायत" },
  "appeal.response": { en: "Department response", hi: "विभाग का जवाब" },
  "appeal.source": { en: "Source", hi: "स्रोत" },
  "feedback.title": { en: "How would you rate the response?", hi: "आप जवाब को कैसे आँकेंगे?" },
  "feedback.satisfied": { en: "Satisfied", hi: "संतुष्ट" },
  "feedback.partly": { en: "Partly satisfied", hi: "आंशिक रूप से संतुष्ट" },
  "feedback.poor": { en: "Not satisfied", hi: "संतुष्ट नहीं" },
  "feedback.unresolved": { en: "What remains unresolved?", hi: "क्या अनसुलझा है?" },
  "feedback.submit": { en: "Submit demo feedback", hi: "डेमो प्रतिक्रिया भेजें" },
  "appeal.title": { en: "Prepare your appeal", hi: "अपनी अपील तैयार करें" },
  "appeal.selectPrompt": { en: "Select the points to include in your appeal:", hi: "अपील में शामिल करने के लिए बिंदु चुनें:" },
  "appeal.include": { en: "Include this point", hi: "इस बिंदु को शामिल करें" },
  "appeal.generate": { en: "Generate appeal draft", hi: "अपील का मसौदा बनाएँ" },
  "appeal.draftTitle": { en: "Your appeal draft", hi: "आपकी अपील का मसौदा" },
  "appeal.sourceBacked": { en: "Source-backed", hi: "स्रोत-आधारित" },
  "appeal.edit": { en: "Edit draft", hi: "मसौदा संपादित करें" },
  "appeal.continue": { en: "Continue to review", hi: "समीक्षा के लिए आगे बढ़ें" },
  "verify.title": { en: "Review before continuing", hi: "आगे बढ़ने से पहले समीक्षा करें" },
  "verify.c1": { en: "I reviewed the original grievance.", hi: "मैंने मूल शिकायत देखी।" },
  "verify.c2": { en: "I reviewed the department response.", hi: "मैंने विभाग का जवाब देखा।" },
  "verify.c3": { en: "The generated appeal reflects my issue.", hi: "बनाई गई अपील मेरी समस्या को सही दर्शाती है।" },
  "verify.c4": { en: "I understand this is a hackathon demo.", hi: "मैं समझता/समझती हूँ कि यह एक हैकाथॉन डेमो है।" },
  "verify.c5": { en: "No government system will be contacted.", hi: "किसी सरकारी सिस्टम से संपर्क नहीं किया जाएगा।" },
  "verify.submit": { en: "Submit demo appeal", hi: "डेमो अपील भेजें" },
  "success.title": { en: "Demo appeal submitted", hi: "डेमो अपील भेजी गई" },
  "success.reference": { en: "Reference", hi: "संदर्भ संख्या" },
  "success.note": { en: "This reference exists only inside this prototype.", hi: "यह संदर्भ संख्या केवल इस प्रोटोटाइप में मौजूद है।" },
  "success.track": { en: "View tracking", hi: "ट्रैकिंग देखें" },
  "track.title": { en: "Appeal tracking", hi: "अपील ट्रैकिंग" },
  "track.submitted": { en: "Submitted", hi: "भेजी गई" },
  "track.review": { en: "Under review", hi: "समीक्षाधीन" },
  "track.decision": { en: "Decision", hi: "निर्णय" },
  "track.advance": { en: "Advance demo status", hi: "डेमो स्थिति आगे बढ़ाएँ" },
  "track.judgeNote": { en: "For judges: advance the mock status to see the timeline move.", hi: "जजों के लिए: टाइमलाइन को आगे बढ़ते देखने के लिए मॉक स्थिति बढ़ाएँ।" },
  "common.listen": { en: "Listen", hi: "सुनें" },
  "common.stop": { en: "Stop", hi: "रोकें" },
  "common.back": { en: "Back", hi: "वापस" },
  "common.mock": { en: "Mock", hi: "मॉक" },
  "common.real": { en: "Real", hi: "असली" },
  "common.live": { en: "Live AI analysis", hi: "लाइव AI विश्लेषण" },
  "common.cached": { en: "Demo analysis", hi: "डेमो विश्लेषण" },
  "common.privacyWarn": {
    en: "Demo only. Do not enter real personal or government account information.",
    hi: "केवल डेमो। असली निजी या सरकारी खाता जानकारी न भरें।",
  },
  "mockreal.title": { en: "What works in this prototype?", hi: "इस प्रोटोटाइप में क्या काम करता है?" },
};

export function t(key: string, lang: Lang): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en;
}
