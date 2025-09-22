import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CreateContractPage.css';

interface Client {
  _id: string;
  clientName: string;
}

const contractPlaceholders = {
  'Web Development': [
    'agreement_date',
    'company_name',
    'company_entity_type',
    'company_address',
    'company_signatory_name',
    'company_signatory_title',
    'client_name',
    'client_address',
    'client_signatory_name',
    'client_signatory_title',
    'signature_date',
    'termination_notice_period',
    'cure_period_days',
    'invoice_due_days',
    'late_payment_interest',
    'confidentiality_period_years',
    'company_county',
    'project_name',
    'number_of_pages',
    'features_list',
    'technology_stack',
    'revision_count',
    'exclusions_list',
    'deliverables',
    'project_start_date',
    'project_end_date',
    'mockup_date',
    'dev_complete_date',
    'deployment_date',
    'total_fee',
    'payment_schedule',
  ],
  Cybersecurity: [
    'agreement_date',
    'company_name',
    'company_entity_type',
    'company_address',
    'company_signatory_name',
    'company_signatory_title',
    'client_name',
    'client_address',
    'client_signatory_name',
    'client_signatory_title',
    'signature_date',
    'termination_notice_period',
    'cure_period_days',
    'invoice_due_days',
    'late_payment_interest',
    'confidentiality_period_years',
    'company_county',
    'project_name',
    'testing_scope',
    'include_retest',
    'exclusions_list',
    'project_start_date',
    'initial_assessment_date',
    'final_report_date',
    'total_fee',
    'payment_schedule',
  ],
};

const contractExamples: Record<string, string> = {
  agreement_date: '2025-09-21',
  company_name: 'Webflare Design Co',
  company_entity_type: 'LLC',
  company_address: '123 Main St, Ogdensburg, NY',
  company_signatory_name: 'Judson Wells',
  company_signatory_title: 'CEO',
  client_name: 'Acme Corp',
  client_address: '456 Elm St, Albany, NY',
  client_signatory_name: 'John Doe',
  client_signatory_title: 'CTO',
  signature_date: '2025-09-21',
  termination_notice_period: '30',
  cure_period_days: '15',
  invoice_due_days: '15',
  late_payment_interest: '1.5',
  confidentiality_period_years: '3',
  company_county: 'St. Lawrence',
  project_name: 'Website Redesign',
  number_of_pages: '10',
  features_list: 'CMS, E-commerce, Blog',
  technology_stack: 'React, Django, MongoDB',
  revision_count: '3',
  exclusions_list: 'Hosting, Copywriting',
  deliverables: 'Website deployed',
  project_start_date: '2025-10-01',
  project_end_date: '2025-11-15',
  mockup_date: '2025-10-10',
  dev_complete_date: '2025-11-01',
  deployment_date: '2025-11-15',
  total_fee: '5000',
  payment_schedule: '50% upfront, 50% on completion',
  testing_scope: 'Web app penetration testing, network vulnerability scanning',
  include_retest: 'Yes',
  initial_assessment_date: '2025-10-15',
  final_report_date: '2025-10-20',
};

export const CreateContractPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [serviceType, setServiceType] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchClients = async () => {
      if (!token) return;
      try {
        const { data } = await axios.get('/api/v1/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(data);
      } catch (error) {
        console.error('Failed to fetch clients', error);
      }
    };
    fetchClients();
  }, [token]);

  const handleServiceTypeChange = (
    type: 'Web Development' | 'Cybersecurity'
  ) => {
    setServiceType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/v1/contracts',
        {
          client: selectedClient,
          serviceType,
          contractData: formData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/contracts');
    } catch (error) {
      console.error('Failed to create contract', error);
    }
  };

  const getFormFields = () => {
    const fields = new Set<string>();
    if (serviceType.includes('Web Development')) {
      contractPlaceholders['Web Development'].forEach((field) =>
        fields.add(field)
      );
    }
    if (serviceType.includes('Cybersecurity')) {
      contractPlaceholders['Cybersecurity'].forEach((field) =>
        fields.add(field)
      );
    }
    return Array.from(fields);
  };

  return (
    <div className="page-container">
      <h1>Create New Contract</h1>
      <form onSubmit={handleSubmit} className="contract-form">
        <div className="form-section">
          <h2>Client and Service Selection</h2>
          <div className="form-group">
            <label>Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              required>
              <option value="" disabled>
                Select a client
              </option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.clientName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Service Type(s)</label>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={serviceType.includes('Web Development')}
                  onChange={() => handleServiceTypeChange('Web Development')}
                />
                Web Development
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={serviceType.includes('Cybersecurity')}
                  onChange={() => handleServiceTypeChange('Cybersecurity')}
                />
                Cybersecurity
              </label>
            </div>
          </div>
        </div>

        {serviceType.length > 0 && (
          <div className="form-section">
            <h2>Contract Details</h2>
            {getFormFields().map((field) => (
              <div className="form-group" key={field}>
                <label>{field.replace(/_/g, ' ')}</label>
                <input
                  type="text"
                  name={field}
                  value={formData[field] || ''}
                  onChange={handleFormChange}
                  placeholder={contractExamples[field] || ''}
                />
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="submit-btn">
          Create Contract
        </button>
      </form>
    </div>
  );
};
