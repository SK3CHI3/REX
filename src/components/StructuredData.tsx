import { Case } from '@/types';

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
        "item": "https://policebrutalitytracker.co.ke"
      },
      ...(pageType === 'map' ? [{
        "@type": "ListItem",
        "position": 2,
        "name": "Map View",
        "item": "https://policebrutalitytracker.co.ke/map"
      }] : []),
      ...(pageType === 'cases' ? [{
        "@type": "ListItem",
        "position": 2,
        "name": "All Cases",
        "item": "https://policebrutalitytracker.co.ke/cases"
      }] : []),
      ...(currentCase ? [{
        "@type": "ListItem",
        "position": 3,
        "name": currentCase.victimName,
        "item": `https://policebrutalitytracker.co.ke/cases/${currentCase.id}`
      }] : [])
    ]
  });

  const getDatasetStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Police Brutality Incidents in Kenya",
    "description": "Comprehensive dataset of police brutality incidents across Kenya with geographic and temporal data",
    "url": "https://policebrutalitytracker.co.ke/cases",
    "keywords": ["police brutality", "Kenya", "human rights", "accountability", "transparency"],
    "spatialCoverage": {
      "@type": "Country",
      "name": "Kenya"
    },
    "temporalCoverage": "2020/2024",
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "creator": {
      "@type": "Organization",
      "name": "PoliceBrutalityTracker Team"
    },
    "distribution": {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://policebrutalitytracker.co.ke/api/cases"
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
    "name": caseItem.victimName,
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
      ...(caseItem.coordinates ? {
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": caseItem.coordinates[0],
          "longitude": caseItem.coordinates[1]
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
      "name": "PoliceBrutalityTracker Team"
    },
    "url": `https://policebrutalitytracker.co.ke/cases/${caseItem.id}`
  });

  const getWebSiteStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PoliceBrutalityTracker - Justice through visibility",
    "alternateName": "PoliceBrutalityTracker Kenya",
    "url": "https://policebrutalitytracker.co.ke",
    "description": "Interactive platform mapping incidents of police brutality across Kenya. Track, report, and visualize cases of police misconduct. Justice through visibility and transparency.",
    "inLanguage": "en-KE",
    "isAccessibleForFree": true,
    "publisher": {
      "@type": "Organization",
      "name": "PoliceBrutalityTracker Team",
      "url": "https://policebrutalitytracker.co.ke",
      "logo": {
        "@type": "ImageObject",
        "url": "https://policebrutalitytracker.co.ke/logo.svg",
        "width": 200,
        "height": 200
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://policebrutalitytracker.co.ke/cases?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  });

  const getFAQStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is PoliceBrutalityTracker?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "PoliceBrutalityTracker is an interactive platform that maps incidents of police brutality across Kenya to promote justice through visibility and transparency."
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

  const getStructuredData = (): any[] => {
    const data: any[] = [getWebSiteStructuredData(), getBreadcrumbStructuredData()];
    
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
