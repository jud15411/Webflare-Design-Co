import { type Response } from 'express';
import { type AuthRequest } from '../../middleware/auth.middleware.js';
import { Contract } from './contract.model.js';
// FIX: Correctly import PdfPrinter
import PdfPrinter from 'pdfmake';

// ... (functions from createContract to updateContractStatus remain the same)
const fillPlaceholders = (
  text: string,
  data: Record<string, string>
): string => {
  let filledText = text;
  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    filledText = filledText.replace(regex, data[key] || '');
  }
  return filledText;
};
export const createContract = async (req: AuthRequest, res: Response) => {
  try {
    const { client, serviceType, contractData } = req.body;
    if (!client || !serviceType || !contractData) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const newContract = await Contract.create({
      client,
      serviceType,
      contractData,
    });
    res.status(201).json(newContract);
  } catch (error) {
    res.status(500).json({ message: 'Error creating contract.', error });
  }
};
export const getContracts = async (req: AuthRequest, res: Response) => {
  try {
    const contracts = await Contract.find()
      .populate({ path: 'client', select: 'clientName' })
      .sort({ createdAt: -1 });
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contracts.', error });
  }
};
export const getContractById = async (req: AuthRequest, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id).populate('client');
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found.' });
    }
    res.status(200).json(contract);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching contract details.', error });
  }
};
export const updateContractStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedContract = await Contract.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedContract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.status(200).json(updatedContract);
  } catch (error) {
    res.status(500).json({ message: 'Error updating contract status', error });
  }
};

const getFullDocDefinition = (
  contractData: Record<string, string>,
  serviceTypes: string[],
  clientName: string
) => {
  // --- Master Services Agreement Content ---
  let content: any[] = [
    { text: 'Master Services Agreement (MSA)', style: 'header' },
    {
      text: `This Master Services Agreement is entered into as of {{agreement_date}}, by and between:`,
      style: 'paragraph',
    },
    {
      text: `{{company_name}}, a {{company_entity_type}} organized under the laws of the State of New York, with its principal place of business at {{company_address}} ("Company"), and`,
      style: 'paragraph',
      bold: true,
    },
    {
      text: `${clientName}, with its principal place of business at {{client_address}} ("Client").`,
      style: 'paragraph',
      bold: true,
      margin: [0, 0, 0, 20],
    },

    { text: '1. Scope of Services', style: 'h2' },
    {
      text: '1.1 Company agrees to provide professional services to Client, which may include Web Development Services and/or Cybersecurity Services.',
      style: 'paragraph',
    },
    {
      text: '1.2 The specific scope, deliverables, and timelines for each engagement will be set forth in a Statement of Work or Service Addendum, attached hereto and incorporated by reference.',
      style: 'paragraph',
    },
    {
      text: '1.3 In the event of any conflict between this Agreement and a SOW/Addendum, the terms of the SOW/Addendum shall govern solely with respect to that engagement.',
      style: 'paragraph',
    },

    { text: '2. Term & Termination', style: 'h2' },
    {
      text: `2.1 This Agreement shall commence on {{agreement_date}} and continue until terminated.`,
      style: 'paragraph',
    },
    {
      text: '2.2 Either party may terminate this Agreement or any active SOW:',
      style: 'paragraph',
    },
    {
      ul: [
        `For convenience, upon {{termination_notice_period}} days' written notice; or`,
        `Immediately, for material breach, if such breach is not cured within {{cure_period_days}} days of notice.`,
      ],
      style: 'list',
    },
    {
      text: '2.3 Upon termination, Client shall pay Company for all Services rendered and expenses incurred up to the effective date of termination.',
      style: 'paragraph',
    },

    { text: '3. Client Responsibilities', style: 'h2' },
    { text: 'Client agrees to:', style: 'paragraph' },
    {
      ul: [
        'Provide timely access to information, personnel, and systems reasonably required for the Company to perform Services.',
        'Review deliverables and provide feedback or approvals without unreasonable delay.',
        'Ensure that Client has the legal right to provide any materials, systems, or data necessary for Services.',
      ],
      style: 'list',
    },

    { text: '4. Fees & Payment', style: 'h2' },
    {
      text: '4.1 Fees for Services shall be set forth in each SOW/Addendum.',
      style: 'paragraph',
    },
    {
      text: `4.2 Unless otherwise stated, invoices are due within {{invoice_due_days}} days of receipt.`,
      style: 'paragraph',
    },
    {
      text: `4.3 Late payments may incur interest at {{late_payment_interest}}% per month.`,
      style: 'paragraph',
    },
    {
      text: '4.4 The company reserves the right to suspend Services for failure to make timely payment.',
      style: 'paragraph',
    },

    { text: '5. Confidentiality', style: 'h2' },
    {
      text: '5.1 Each party agrees to maintain in confidence any non-public information disclosed by the other party and to use such information solely to perform obligations under this Agreement.',
      style: 'paragraph',
    },
    {
      text: `5.2 Confidentiality obligations survive termination for {{confidentiality_period_years}} years, except for trade secrets, which shall remain confidential as long as they remain trade secrets.`,
      style: 'paragraph',
    },

    { text: '6. Intellectual Property', style: 'h2' },
    { text: '6.1 Web Development Services:', style: 'paragraph', bold: true },
    {
      ul: [
        'Client shall own all final deliverables specifically created for Client under a SOW, upon full payment.',
        'The company retains ownership of all pre-existing tools, frameworks, templates, or intellectual property used in providing Services.',
      ],
      style: 'list',
    },
    { text: '6.2 Cybersecurity Services:', style: 'paragraph', bold: true },
    {
      ul: [
        'Clients shall own final reports, test results, and recommendations produced under a SOW.',
        'Companies may retain anonymized findings for internal training and research purposes.',
      ],
      style: 'list',
    },

    { text: '7. Warranties & Disclaimers', style: 'h2' },
    {
      text: '7.1 Company warrants that Services shall be performed in a professional and workmanlike manner.',
      style: 'paragraph',
    },
    {
      text: '7.2 EXCEPT AS EXPRESSLY PROVIDED HEREIN, COMPANY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.',
      style: 'paragraph',
      bold: true,
    },
    { text: '7.3 Client acknowledges that:', style: 'paragraph' },
    {
      ul: [
        'For Web Development, the company cannot guarantee increased sales, traffic, or specific business outcomes.',
        'For Cybersecurity, no system can be guaranteed 100% secure, and Services reduce but do not eliminate security risks.',
      ],
      style: 'list',
    },

    { text: '8. Limitation of Liability', style: 'h2' },
    {
      text: `To the maximum extent permitted under New York law, Company's total liability for any claim arising out of this Agreement shall not exceed the total fees paid by Client to Company under the applicable SOW.`,
      style: 'paragraph',
    },
    {
      text: 'Neither party shall be liable for indirect, incidental, or consequential damages.',
      style: 'paragraph',
    },

    { text: '9. Governing Law & Dispute Resolution', style: 'h2' },
    {
      text: `This Agreement shall be governed by and construed in accordance with the laws of the State of New York, without regard to conflicts of law principles.`,
      style: 'paragraph',
    },
    {
      text: `Any disputes arising hereunder shall be resolved in the state or federal courts located in {{company_county}} County, New York, and the parties consent to such jurisdiction.`,
      style: 'paragraph',
    },

    { text: '10. Miscellaneous', style: 'h2' },
    {
      ul: [
        'Entire Agreement: This Agreement, together with all SOWs/Addendums, constitutes the entire understanding between the parties.',
        'Amendments: Must be in writing and signed by both parties.',
        `Assignment: Neither party may assign this Agreement without the other's consent, except in the case of a merger or acquisition.`,
        'Notices: All notices shall be in writing and delivered via email or certified mail to the addresses set forth above.',
      ],
      style: 'list',
    },

    { text: '11. Signatures', style: 'h2' },
    {
      text: 'IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.',
      style: 'paragraph',
    },
    {
      columns: [
        {
          stack: [
            { text: `{{company_name}}`, bold: true },
            {
              text: '\n\n\n_________________________________',
              margin: [0, 20, 0, 10],
            },
            { text: `Name: {{company_signatory_name}}` },
            { text: `Title: {{company_signatory_title}}` },
            { text: `Date: {{signature_date}}` },
          ],
        },
        {
          stack: [
            { text: `${clientName}`, bold: true },
            {
              text: '\n\n\n_________________________________',
              margin: [0, 20, 0, 10],
            },
            { text: `Name: {{client_signatory_name}}` },
            { text: `Title: {{client_signatory_title}}` },
            { text: `Date: {{signature_date}}` },
          ],
        },
      ],
      margin: [0, 20, 0, 0],
    },
  ];

  if (serviceTypes.includes('Web Development')) {
    content.push({ text: '', pageBreak: 'before' });
    content.push(
      {
        text: 'Exhibit A — Web Development Statement of Work (SOW)',
        style: 'header',
      },
      {
        text: `This Statement of Work is issued under the Master Services Agreement dated {{agreement_date}} between {{company_name}} and ${clientName}.`,
        style: 'paragraph',
        margin: [0, 0, 0, 20],
      },

      { text: '1. Project Overview', style: 'h2' },
      {
        text: 'The company will provide web development services to design, build, and deliver a website for Client as described below.',
        style: 'paragraph',
      },

      { text: '2. Scope of Work', style: 'h2' },
      { text: 'Design & Development:', style: 'paragraph', bold: true },
      {
        ul: [
          `Number of pages: {{number_of_pages}}`,
          `Features: {{features_list}}`,
          `Technology stack: {{technology_stack}}`,
        ],
        style: 'list',
      },
      { text: 'Revisions:', style: 'paragraph', bold: true },
      {
        text: `Up to {{revision_count}} rounds of design revisions are included. Additional revisions may incur extra fees.`,
        style: 'paragraph',
      },
      { text: 'Exclusions:', style: 'paragraph', bold: true },
      { text: `{{exclusions_list}}`, style: 'paragraph' },

      { text: '3. Deliverables', style: 'h2' },
      {
        ul: [
          `Completed website deployed to Client's hosting environment`,
          'Source code (if included)',
          'Documentation for site maintenance',
        ],
        style: 'list',
      },

      { text: '4. Timeline', style: 'h2' },
      {
        ul: [
          `Project start: {{project_start_date}}`,
          `Estimated completion: {{project_end_date}}`,
        ],
        style: 'list',
      },
      { text: 'Milestones:', style: 'paragraph', bold: true },
      {
        ul: [
          `Design mockups delivered: {{mockup_date}}`,
          `Development complete: {{dev_complete_date}}`,
          `Final testing & deployment: {{deployment_date}}`,
        ],
        style: 'list',
      },

      { text: '5. Fees & Payment', style: 'h2' },
      {
        ul: [
          `Total project fee: \${{total_fee}}`,
          `Payment schedule: {{payment_schedule}}`,
        ],
        style: 'list',
      },

      { text: '6. Client Responsibilities', style: 'h2' },
      {
        ul: [
          'Provide branding assets, content, and approvals on a timely basis.',
          'Provide access to hosting, domain, or third-party accounts as needed.',
        ],
        style: 'list',
      }
    );
  }

  if (serviceTypes.includes('Cybersecurity')) {
    content.push({ text: '', pageBreak: 'before' });
    content.push(
      {
        text: 'Exhibit B — Cybersecurity Statement of Work (SOW)',
        style: 'header',
      },
      {
        text: `This Statement of Work is issued under the Master Services Agreement dated {{agreement_date}} between {{company_name}} and ${clientName}.`,
        style: 'paragraph',
        margin: [0, 0, 0, 20],
      },

      { text: '1. Project Overview', style: 'h2' },
      {
        text: `The company will perform cybersecurity services for Client, consisting of testing, analysis, and recommendations to improve Client's security posture.`,
        style: 'paragraph',
      },

      { text: '2. Scope of Work', style: 'h2' },
      { text: 'Testing Services:', style: 'paragraph', bold: true },
      { text: `{{testing_scope}}`, style: 'paragraph' },
      { text: 'Analysis & Reporting:', style: 'paragraph', bold: true },
      {
        ul: [
          'Detailed report of vulnerabilities discovered',
          'Risk ratings & recommended remediation steps',
        ],
        style: 'list',
      },
      {
        text: `Retest after remediation (if included in scope: {{include_retest}})`,
        style: 'paragraph',
      },
      { text: 'Exclusions:', style: 'paragraph', bold: true },
      { text: `{{exclusions_list}}`, style: 'paragraph' },

      { text: '3. Deliverables', style: 'h2' },
      {
        ul: [
          'Security assessment report in PDF format',
          'Executive summary presentation (if required)',
          'Retest report (if in scope)',
        ],
        style: 'list',
      },

      { text: '4. Timeline', style: 'h2' },
      {
        ul: [
          `Project start: {{project_start_date}}`,
          `Initial assessment complete: {{initial_assessment_date}}`,
          `Final report delivered: {{final_report_date}}`,
        ],
        style: 'list',
      },

      { text: '5. Fees & Payment', style: 'h2' },
      {
        ul: [
          `Total project fee: \${{total_fee}}`,
          `Payment schedule: {{payment_schedule}}`,
        ],
        style: 'list',
      },

      { text: '6. Client Responsibilities', style: 'h2' },
      {
        ul: [
          'Provide written authorization for testing activities.',
          'Provide system/network access, credentials, and documentation as required.',
          'Respond to findings and coordinate remediation as needed.',
        ],
        style: 'list',
      }
    );
  }

  const finalContent = JSON.parse(
    fillPlaceholders(JSON.stringify(content), contractData)
  );

  const styles = {
    header: {
      fontSize: 22,
      bold: true,
      alignment: 'center' as 'center',
      margin: [0, 0, 0, 20] as [number, number, number, number],
    },
    h2: {
      fontSize: 16,
      bold: true,
      margin: [0, 15, 0, 5] as [number, number, number, number],
    },
    paragraph: {
      fontSize: 12,
      margin: [0, 0, 0, 10] as [number, number, number, number],
      lineHeight: 1.15,
    },
    list: {
      fontSize: 12,
      margin: [20, 0, 0, 10] as [number, number, number, number],
    },
  };

  return {
    content: finalContent,
    styles: styles,
  };
};

export const generateContract = async (req: AuthRequest, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id).populate('client');
    if (!contract || !contract.client) {
      return res.status(404).json({ message: 'Contract or client not found.' });
    }

    const contractData = Object.fromEntries(contract.contractData);
    const clientName =
      (contract.client as any).clientName || contractData.client_name;
    const docDefinition: any = getFullDocDefinition(
      contractData,
      contract.serviceType,
      clientName
    );

    if (req.query.format !== 'pdf') {
      let html = '';
      docDefinition.content.forEach((item: any) => {
        if (item.style === 'header') html += `<h1>${item.text}</h1>`;
        else if (item.style === 'h2') html += `<h2>${item.text}</h2>`;
        else if (item.text) html += `<p>${item.text}</p>`;
        if (item.ul) {
          html += `<ul>${item.ul
            .map((li: string) => `<li>${li}</li>`)
            .join('')}</ul>`;
        }
      });
      return res.send(html);
    }

    const fonts = {
      Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };
    const printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    const chunks: any[] = [];
    // FIX: Add an explicit 'any' type to the chunk parameter
    pdfDoc.on('data', (chunk: any) => chunks.push(chunk));
    pdfDoc.on('end', () => {
      const result = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=contract.pdf');
      res.send(result);
    });
    pdfDoc.end();
  } catch (error) {
    console.error('🔴 PDF Generation Failed:', error);
    res
      .status(500)
      .json({ message: 'There was an error generating the PDF file.' });
  }
};
// ... (updateContract function remains the same)
export const updateContract = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { contractData } = req.body;
    const updatedContract = await Contract.findByIdAndUpdate(
      id,
      { contractData },
      { new: true }
    );
    if (!updatedContract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.status(200).json(updatedContract);
  } catch (error) {
    res.status(500).json({ message: 'Error updating contract', error });
  }
};
