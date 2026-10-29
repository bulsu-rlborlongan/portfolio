// Certificates, from the "Licenses & certifications" section of LinkedIn, newest first.
// `href` is where "Verify" points; a credential without its own page falls back to the LinkedIn list.
const LINKEDIN_CERTS = "https://www.linkedin.com/in/rap-borlongan-623058379/details/certifications/";

export type Certificate = {
  name: string;
  issuer: string;
  logo: "google" | "salesforce" | "skillfront";
  issued: string;
  credentialId: string;
  href: string;
};

export const CERTIFICATES: Certificate[] = [
  {
    name: "Google AI",
    issuer: "Google",
    logo: "google",
    issued: "Sep 2026",
    credentialId: "0L5UNWQBCARH",
    href: "https://www.coursera.org/account/accomplishments/professional-cert/certificate/0L5UNWQBCARH",
  },
  {
    name: "Platform Developer I",
    issuer: "Salesforce",
    logo: "salesforce",
    issued: "Sep 2026",
    credentialId: "8161307",
    href: "https://drive.google.com/file/d/1fUTMs30ZinKBFUlNzZ6DfDAkfbCXMrHK/view?usp=sharing",
  },
  {
    name: "ISO/IEC 20000 IT Service Management Associate™",
    issuer: "SkillFront",
    logo: "skillfront",
    issued: "Jul 2026",
    credentialId: "63114640535245",
    href: "https://drive.google.com/file/d/1D6GsDOhYfShjAbsKme-hmaqdCMxunUay/view?usp=sharing",
  },
  {
    name: "Supported Virtual Internship Program 2025",
    issuer: "Salesforce",
    logo: "salesforce",
    issued: "Apr 2026",
    credentialId: "SWSFVIPAD2026-1330",
    href: LINKEDIN_CERTS,
  },
];
