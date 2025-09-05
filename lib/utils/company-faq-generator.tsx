import { ReactNode } from 'react';

interface CompanyInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  pan: string;
  created_at: string;
  updated_at: string;
}

interface FAQItem {
  question: string;
  answer: ReactNode;
  value: string;
}

export function generateCompanyFAQs(companies: CompanyInfo[]): FAQItem[] {
  if (companies.length === 0) {
    return [];
  }

  const company1 = companies[0];
  const company2 = companies[1];

  const faqItems: FAQItem[] = [
    {
      question: "Who are the companies behind ClayGrounds?",
      value: "companies-overview",
      answer: (
        <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
          ClayGrounds is operated by two main companies: {company1?.name || 'GoalTech Innovation India Private Limited'} and {company2?.name || 'IT Magia Solutions Pvt Ltd'}. Both companies work together to provide comprehensive sports facility management and technology solutions for our platform.
        </p>
      ),
    },
    {
      question: "How can I contact these companies?",
      value: "contact-information",
      answer: (
        <div className="space-y-4 max-w-[640px]">
          <p className="text-muted-foreground text-balance">
            You can reach {company1?.name || 'GoalTech Innovation India'} at {company1?.email || 'info@goaltech.in'} or call them at {company1?.phone || '9999099867'}. For {company2?.name || 'IT Magia Solutions'}, contact {company2?.email || 'arpit@itmagia.com'} or call {company2?.phone || '9910545678'}.
          </p>
          <p className="text-muted-foreground text-balance">
            Both companies are available for business inquiries, partnerships, and customer support.
          </p>
        </div>
      ),
    },
    {
      question: "Where are these companies located?",
      value: "company-locations", 
      answer: (
        <div className="space-y-4 max-w-[640px]">
          <p className="text-muted-foreground text-balance">
            {company1?.name || 'GoalTech Innovation India'} is located at {company1?.address || 'KH 713, 733/1, 738/2, 736/1, Sultanpur Village, Gadaipur Road, Mehrauli, Delhi, 110030'}.
          </p>
          <p className="text-muted-foreground text-balance">
            {company2?.name || 'IT Magia Solutions'} is based at {company2?.address || 'K-713, Plaza Farm, Gadaipur Mandi Road, Mehrauli, South West Delhi, Delhi, 110030'}.
          </p>
          <p className="text-muted-foreground text-balance">
            Both companies operate from the Delhi region, ensuring local expertise and support.
          </p>
        </div>
      ),
    },
    {
      question: "What are the business registration details?",
      value: "business-registration",
      answer: (
        <div className="space-y-4 max-w-[640px]">
          <p className="text-muted-foreground text-balance">
            {company1?.name || 'GoalTech Innovation India'} is registered with GSTIN {company1?.gstin || '07AAKCG7299N1ZM'} and PAN {company1?.pan || 'AAKCG7299N'}.
          </p>
          <p className="text-muted-foreground text-balance">
            {company2?.name || 'IT Magia Solutions'} is registered with GSTIN {company2?.gstin || '07AADCI0501N1ZS'} and PAN {company2?.pan || 'AADCI0501N'}.
          </p>
          <p className="text-muted-foreground text-balance">
            Both companies are fully compliant with Indian business regulations and maintain active registrations.
          </p>
        </div>
      ),
    },
    {
      question: "When were these companies established?",
      value: "establishment-dates",
      answer: (
        <div className="space-y-4 max-w-[640px]">
          <p className="text-muted-foreground text-balance">
            {company2?.name || 'IT Magia Solutions'} has been operating since {formatDate(company2?.created_at) || 'October 2018'}, making them our longer-established partner with extensive experience in the sports technology sector.
          </p>
          <p className="text-muted-foreground text-balance">
            {company1?.name || 'GoalTech Innovation India'} joined more recently in {formatDate(company1?.created_at) || 'August 2025'}, bringing fresh innovation and expanded capabilities to our platform.
          </p>
          <p className="text-muted-foreground text-balance">
            Both companies continue to grow and expand their services to better serve our community.
          </p>
        </div>
      ),
    },
    {
      question: "What makes these companies reliable partners?",
      value: "reliability-credentials",
      answer: (
        <div className="space-y-4 max-w-[640px]">
          <p className="text-muted-foreground text-balance">
            Both companies are fully verified and approved partners with active business registrations and up-to-date compliance records. {company1?.name || 'GoalTech Innovation India'} and {company2?.name || 'IT Magia Solutions'} maintain transparency in their operations.
          </p>
          <p className="text-muted-foreground text-balance">
            They have been consistently updating their business information and maintaining their platforms, demonstrating their commitment to reliability and excellence in service delivery.
          </p>
          <p className="text-muted-foreground text-balance">
            Their combined expertise ensures robust platform management and continuous innovation in sports facility booking technology.
          </p>
        </div>
      ),
    },
  ];

  return faqItems;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  } catch {
    return dateString;
  }
}
