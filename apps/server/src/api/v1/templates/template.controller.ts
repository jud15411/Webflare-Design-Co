import { type Response } from 'express';
import { type AuthRequest } from '../../middleware/auth.middleware.js';
import { Template } from './template.model.js';

export const seedTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const templates = [
      {
        name: 'Master Services Agreement',
        serviceType: 'MSA',
        content: `
          <style>
            .signature-section { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            .signature-block { border-top: 1px solid #000; padding-top: 10px; }
          </style>
          <h1>Master Services Agreement (MSA)</h1>
          <p>This Master Services Agreement is entered into as of {{agreement_date}}, by and between:</p>
          <p><strong>{{company_name}}</strong>, a {{company_entity_type}}, with its principal place of business at {{company_address}}, and</p>
          <p><strong>{{client_name}}</strong>, with its principal place of business at {{client_address}}.</p>
          <h2>1. Scope of Services</h2>
          <p>The specific scope will be set forth in a Statement of Work.</p>
          <h2>2. Term & Termination</h2>
          <p>Termination requires {{termination_notice_period}} days' written notice. Breach must be cured within {{cure_period_days}} days.</p>
          <h2>4. Fees & Payment</h2>
          <p>Invoices are due within {{invoice_due_days}} days. Late payments may incur interest at {{late_payment_interest}}% per month.</p>
          <h2>9. Governing Law & Dispute Resolution</h2>
          <p>This Agreement shall be governed by the laws of the State of New York. Disputes shall be resolved in {{company_county}} County, New York.</p>
          
          <h2>11. Signatures</h2>
          <div class="signature-section">
            <div class="signature-block">
              <strong>{{company_name}}</strong>
              <p style="margin-top: 40px;">By:____________________________</p>
              <p>Name: {{company_signatory_name}}</p>
              <p>Title: {{company_signatory_title}}</p>
              <p>Date: {{signature_date}}</p>
            </div>
            <div class="signature-block">
              <strong>{{client_name}}</strong>
              <p style="margin-top: 40px;">By:____________________________</p>
              <p>Name: {{client_signatory_name}}</p>
              <p>Title: {{client_signatory_title}}</p>
              <p>Date: {{signature_date}}</p>
            </div>
          </div>
        `,
      },
      // ... SOW templates remain the same
      {
        name: 'Web Development SOW',
        serviceType: 'Web Development',
        content: `
            <h1>Exhibit A - Web Development Statement of Work (SOW)</h1>
            <p>Issued under the MSA dated {{agreement_date}}.</p>
            <h2>1. Project Overview</h2>
            <p>To design, build, and deliver a website for the Client.</p>
            <h2>2. Scope of Work</h2>
            <ul>
                <li><strong>Number of pages:</strong> {{number_of_pages}}</li>
                <li><strong>Features:</strong> {{features_list}}</li>
                <li><strong>Technology stack:</strong> {{technology_stack}}</li>
            </ul>
            <h2>4. Timeline</h2>
            <ul>
                <li><strong>Project start:</strong> {{project_start_date}}</li>
                <li><strong>Estimated completion:</strong> {{project_end_date}}</li>
            </ul>
            <h2>5. Fees & Payment</h2>
            <p><strong>Total project fee:</strong> &#36;{{total_fee}}</p>
            <p><strong>Payment schedule:</strong> {{payment_schedule}}</p>
            `,
      },
      {
        name: 'Cybersecurity SOW',
        serviceType: 'Cybersecurity',
        content: `
            <h1>Exhibit B - Cybersecurity Statement of Work (SOW)</h1>
            <p>Issued under the MSA dated {{agreement_date}}.</p>
            <h2>2. Scope of Work</h2>
            <ul>
                <li><strong>Testing Services:</strong> {{testing_scope}}</li>
                <li><strong>Retest Included:</strong> {{include_retest}}</li>
            </ul>
            <h2>4. Timeline</h2>
            <ul>
                <li><strong>Project start:</strong> {{project_start_date}}</li>
                <li><strong>Final report delivered:</strong> {{final_report_date}}</li>
            </ul>
            <h2>5. Fees & Payment</h2>
            <p><strong>Total project fee:</strong> &#36;{{total_fee}}</p>
            <p><strong>Payment schedule:</strong> {{payment_schedule}}</p>
            `,
      },
    ];

    await Template.deleteMany({}); // Clear existing templates
    await Template.insertMany(templates);
    res.status(200).json({ message: 'Templates seeded successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding templates.', error });
  }
};
