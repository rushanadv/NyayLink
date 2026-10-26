/**
 * NyayLink Statutory Vakalatnama Draft Generator
 * Conforming to Section 30 of the Advocates Act, 1961 and General Court Rules.
 */

export interface VakalatnamaData {
  courtName: string;
  caseTitle: string;
  suitNumber?: string;
  clientName: string;
  clientAddress?: string;
  advocateName: string;
  advocateEnrolmentNumber: string;
  advocateChamberAddress?: string;
  dateOfExecution: string;
}

export function generateVakalatnamaText(data: VakalatnamaData): string {
  return `
================================================================================
                    VAKALATNAMA (MEMO OF APPEARANCE)
                 [Under Section 30, Advocates Act, 1961]
================================================================================

IN THE COURT OF: ${data.courtName.toUpperCase()}
CASE / SUIT NO.: ${data.suitNumber || "DRAFT — PENDING REGISTRATION"}

IN THE MATTER OF:
${data.caseTitle}

KNOW ALL to whom these presents shall come that I/We,
${data.clientName}
${data.clientAddress ? `Residing at: ${data.clientAddress}` : ""}
(hereinafter called the 'Executant/Client')

DO HEREBY APPOINT, NOMINATE, AND AUTHORIZE:
${data.advocateName}
Advocate, Enrolment No.: ${data.advocateEnrolmentNumber}
${data.advocateChamberAddress ? `Chamber: ${data.advocateChamberAddress}` : ""}
(hereinafter called the 'Advocate')

To be my/our lawful Advocate in the above-noted case and to conduct, defend, 
prosecute, and appear in all proceedings connected therewith, and for the said 
purpose to do all lawful acts, including:

1. To appear, plead, and act in the aforesaid Court and before any Judge, 
   Magistrate, Registrar, or Bench of the said Court.
2. To sign and verify plaints, petitions, written statements, replications, 
   appeals, reviews, revisions, and execution applications.
3. To file and produce documents, summons, affidavits, and receipts.
4. To apply for and inspect records, obtain certified copies of orders, 
   judgments, and decrees.
5. To withdraw, compromise, or settle the matter upon express instructions 
   of the Executant.
6. To receive all moneys, cheques, or refund vouchers payable to the Executant 
   in the said proceeding.

AND I/WE HEREBY AGREE to ratify and confirm all lawful acts, deeds, and things 
done by the said Advocate as my/our own acts, as if personally present and done by me/us.

EXECUTED AT ${data.courtName} ON THIS ${data.dateOfExecution}.

--------------------------------------------------------------------------------
SIGNATURE / THUMB IMPRESSION OF EXECUTANT (CLIENT):


Name: ${data.clientName}
Date: ${data.dateOfExecution}
--------------------------------------------------------------------------------
ACCEPTED AND IDENTIFIED BY ADVOCATE:


Adv. ${data.advocateName}
Enrolment No.: ${data.advocateEnrolmentNumber}
[Advocate Welfare Stamp to be affixed before physical filing]
================================================================================
[NOTICE: Generated via NyayLink Legal Workspace. Affix applicable Welfare Fund & Court Fee stamps prior to registry submission.]
`.trim();
}
