interface Case {
  id: string;
  title: string;
  description: string;
  county: string;
  date: string;
  type: string;
  latitude?: number;
  longitude?: number;
}

interface StructuredDataProps {
  cases?: Case[];
  pageType?: 'home' | 'map' | 'cases' | 'case-detail';
  currentCase?: Case;
}

const StructuredData = ({ cases = [], pageType = 'home', currentCase }: StructuredDataProps) => {
  const getBreadcrumbStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://rextracker.online"
      },
      ...(pageType === 'map' ? [{
        "@type": "ListItem",
        "position": 2,
        "name": "Map View",
        "item": "https://rextracker.online/map"
      }] : []),
      ...(pageType === 'cases' ? [{
        "@type": "ListItem",
        "position": 2,
        "name": "All Cases",
        "item": "https://rextracker.online/cases"
      }] : []),
      ...(currentCase ? [{
        "@type": "ListItem",
        "position": 3,
        "name": currentCase.title,
        "item": `https://rextracker.online/cases/${currentCase.id}`
      }] : [])
    ]
  });

  const getDatasetStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Police Brutality Incidents in Kenya",
    "description": "Comprehensive dataset of police brutality incidents across Kenya with geographic and temporal data",
    "url": "https://rextracker.online/cases",
    "keywords": ["police brutality", "Kenya", "human rights", "accountability", "transparency"],
    "spatialCoverage": {
      "@type": "Country",
      "name": "Kenya"
    },
    "temporalCoverage": "2020/2024",
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "creator": {
      "@type": "Organization",
      "name": "REX Team"
    },
    "distribution": {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://rextracker.online/api/cases"
    },
    "variableMeasured": [
      "Incident Date",
      "Location (County)",
      "Incident Type",
      "Description",
      "Geographic Coordinates"
    ]
  });

  const getCaseStructuredData = (caseItem: Case) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    "name": caseItem.title,
    "description": caseItem.description,
    "startDate": caseItem.date,
    "location": {
      "@type": "Place",
      "name": caseItem.county,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": caseItem.county,
        "addressCountry": "Kenya"
      },
      ...(caseItem.latitude && caseItem.longitude ? {
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": caseItem.latitude,
          "longitude": caseItem.longitude
        }
      } : {})
    },
    "about": {
      "@type": "Thing",
      "name": "Police Brutality",
      "description": "Incidents of police misconduct and brutality"
    },
    "organizer": {
      "@type": "Organization",
      "name": "REX Team"
    },
    "url": `https://rextracker.online/cases/${caseItem.id}`
  });

  const getWebSiteStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "REX - Justice through visibility",
    "alternateName": "REX Kenya",
    "url": "https://rextracker.online",
    "description": "Interactive platform mapping incidents of police brutality across Kenya. Track, report, and visualize cases of police misconduct. Justice through visibility and transparency.",
    "inLanguage": "en-KE",
    "isAccessibleForFree": true,
    "publisher": {
      "@type": "Organization",
      "name": "REX Team",
      "url": "https://rextracker.online",
      "logo": {
        "@type": "ImageObject",
          "url": "https://rextracker.online/logo.svg",
        "width": 200,
        "height": 200
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://rextracker.online/cases?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  });

  const getFAQStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is REX?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "REX is an interactive platform that maps incidents of police brutality across Kenya to promote justice through visibility and transparency."
        }
      },
      {
        "@type": "Question",
        "name": "How can I report a case?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can report a case by clicking the 'Submit Case' button on our platform and filling out the incident details form."
        }
      },
      {
        "@type": "Question",
        "name": "Is my information safe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we take privacy seriously. All personal information is protected and we only collect necessary data for case tracking."
        }
      },
      {
        "@type": "Question",
        "name": "How often is the data updated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our data is updated regularly as new cases are reported and verified through our platform."
        }
      }
    ]
  });

  const getStructuredData = () => {
    const data = [getWebSiteStructuredData(), getBreadcrumbStructuredData()];
    
    if (pageType === 'cases' || pageType === 'map') {
      data.push(getDatasetStructuredData());
    }
    
    if (pageType === 'case-detail' && currentCase) {
      data.push(getCaseStructuredData(currentCase));
    }
    
    if (pageType === 'home') {
      data.push(getFAQStructuredData());
    }
    
    return data;
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(getStructuredData())}
    </script>
  );
};

export default StructuredData;
