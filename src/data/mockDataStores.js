export const DATASTORES = {
  enterprise: {
    id: "ds-enterprise-docs-v2",
    name: "GCP Enterprise Tech Docs & Architecture",
    type: "Unstructured & Structured Docs",
    icon: "FileText",
    description: "Cloud Architecture Specs, SLA Agreements, Security Blueprints & Compliance Frameworks",
    categories: ["Architecture", "Security & IAM", "Data Analytics", "DevOps & SRE", "Generative AI"],
    sampleQueries: [
      "What are the best practices for setting up BigQuery data security and row-level access?",
      "How to configure low-latency streaming pipelines with Dataflow and Pub/Sub?",
      "What is the Vertex AI Search & Conversation SLA guarantee for multi-region deployments?",
      "How does Gemini 1.5 Pro handle long-context document understanding?"
    ],
    documents: [
      {
        id: "doc-bq-security-01",
        title: "BigQuery Enterprise Data Governance & Row-Level Security Architecture",
        category: "Security & IAM",
        author: "Cloud Data Security Team",
        updatedAt: "2026-06-15",
        relevanceScore: 0.98,
        vectorSimilarity: 0.94,
        lexicalScore: 0.92,
        snippet: "Implement fine-grained access control using BigQuery row-level access policies and column-level data masking. Integrate with Google Cloud IAM groups and Dataplex taxonomy tags to automatically filter queries based on user identity token claims.",
        fullContent: `
# BigQuery Enterprise Data Governance & Row-Level Security Architecture

## Overview
This document outlines recommended patterns for enterprise data governance on Google Cloud BigQuery.

### Key Security Controls
1. **Row-Level Access Policies (RLAP)**: Restrict query results based on user identity (e.g. \`SESSION_USER()\`) or enterprise group membership.
2. **Column-Level Dynamic Data Masking**: Automatically mask PII data fields (SSN, Email, Credit Cards) with hash functions or SHA-256 routines based on IAM taxonomy tags.
3. **Authorized Views & Functions**: Abstract complex SQL joins behind security-definer views preventing direct underlying table access.

### Performance & Optimization
Combining Row-Level Security with BigQuery Partitioning (by \`ingestion_time\` or transaction date) guarantees zero performance degradation during filtered queries.
        `,
        groundingCitations: [
          { text: "Row-Level Access Policies filter results natively at query execution using SESSION_USER()", page: 2 },
          { text: "Dataplex dynamic data masking applies SHA-256 hashes based on taxonomy tags", page: 4 }
        ],
        attributes: {
          confidentiality: "Internal Restricted",
          readTime: "6 min",
          format: "PDF Document"
        }
      },
      {
        id: "doc-dataflow-streaming-02",
        title: "High-Throughput Low-Latency Real-time Analytics with Dataflow & Pub/Sub",
        category: "Data Analytics",
        author: "Data Platform Engineering",
        updatedAt: "2026-05-20",
        relevanceScore: 0.95,
        vectorSimilarity: 0.91,
        lexicalScore: 0.89,
        snippet: "Apache Beam streaming pipelines deployed on Dataproc Serverless / Dataflow Prime process millions of events per second with sub-second sliding window aggregation and automated exact-once processing semantics.",
        fullContent: `
# High-Throughput Low-Latency Real-time Analytics with Dataflow & Pub/Sub

## Architecture Pattern
Stream data from IoT devices or application logs into Pub/Sub topics. Process continuous event streams with Apache Beam (Java/Python) running on Dataflow.

### Key Features
- **Exactly-Once Semantics**: Prevent duplicate processing using Pub/Sub message IDs and Beam stateful storage.
- **Sliding and Session Windows**: Aggregate metrics across 5-minute rolling windows with 10-second sliding intervals.
- **Dataflow Prime Autoscaling**: Dynamically scale worker threads based on backlog bytes and CPU utilization.
        `,
        groundingCitations: [
          { text: "Exactly-once processing guaranteed via Pub/Sub deduplication and Beam stateful triggers", page: 3 }
        ],
        attributes: {
          confidentiality: "Public Standard",
          readTime: "8 min",
          format: "Markdown Spec"
        }
      },
      {
        id: "doc-vertex-sla-03",
        title: "Vertex AI Search & Conversation SLA & Resiliency Specification",
        category: "Generative AI",
        author: "Google Cloud SRE Team",
        updatedAt: "2026-07-01",
        relevanceScore: 0.91,
        vectorSimilarity: 0.88,
        lexicalScore: 0.85,
        snippet: "Vertex AI Search provides 99.9% Monthly Uptime Percentage for Multi-Region DataStores and 99.95% for High Availability Enterprise Tier serving configurations.",
        fullContent: `
# Vertex AI Search & Conversation SLA & Resiliency Specification

## Service Level Agreement
Google Cloud guarantees 99.9% availability for standard Multi-Region serving configs and 99.95% for Enterprise HA deployments.

### Performance Metrics
- **Mean Time to First Token (TTFT)**: < 350ms for Generative Answer Summarization.
- **P99 Vector Retrieval Latency**: < 45ms across 100M+ document vector indexes using ScaNN vector index technology.
        `,
        groundingCitations: [
          { text: "99.95% HA uptime guarantee for Enterprise Tier multi-region datastores", page: 1 },
          { text: "ScaNN vector search engine maintains <45ms P99 retrieval for 100M vectors", page: 3 }
        ],
        attributes: {
          confidentiality: "Customer Facing",
          readTime: "4 min",
          format: "HTML Page"
        }
      },
      {
        id: "doc-gemini-longcontext-04",
        title: "Building Multi-Modal RAG Applications with Gemini 1.5 Pro & Discovery Engine",
        category: "Generative AI",
        author: "AI Research & Solutions Team",
        updatedAt: "2026-07-18",
        relevanceScore: 0.89,
        vectorSimilarity: 0.89,
        lexicalScore: 0.81,
        snippet: "Leverage Gemini 1.5 Pro's 2-million token context window combined with Discovery Engine hybrid semantic search for deep document synthesis, audio transcription RAG, and multi-page diagram analysis.",
        fullContent: `
# Building Multi-Modal RAG Applications with Gemini 1.5 Pro & Discovery Engine

## Abstract
Traditional chunk-based RAG often loses document cohesion across large engineering manuals or financial 10-K filings. Combining Discovery Engine vector retrieval with Gemini 1.5 Pro long context yields unprecedented context synthesis.

### Implementation Blueprint
1. Query Discovery Engine serving config to fetch Top 20 relevant document chunks with extractive snippets.
2. Feed target parent document sections into Gemini 1.5 Pro with multimodal visual context (charts, tables, schematics).
3. Generate grounded answers with exact character-offset citations.
        `,
        groundingCitations: [
          { text: "Gemini 1.5 Pro 2M context window absorbs full parent documents alongside vector snippets", page: 5 }
        ],
        attributes: {
          confidentiality: "Public Standard",
          readTime: "10 min",
          format: "PDF Document"
        }
      }
    ]
  },

  ecommerce: {
    id: "ds-ecommerce-catalog-v1",
    name: "AuraTech Global E-Commerce & Retail Catalog",
    type: "Structured Catalog & Media",
    icon: "ShoppingBag",
    description: "Electronics, Smart Home, Audio Equipment & Wearable Accessories",
    categories: ["Smart Home", "Audio & Wearables", "Monitors & Displays", "Laptops & Computing", "Gaming"],
    sampleQueries: [
      "Noise cancelling wireless headphones under $350 with long battery life",
      "Ergonomic curved 4K monitor for coding and high refresh rate gaming",
      "Robot vacuum cleaner with LiDAR mapping and self-emptying base station",
      "Smart home hub with Matter protocol and offline voice commands"
    ],
    documents: [
      {
        id: "prod-audio-01",
        title: "AuraSound Pro X Wireless Active Noise Cancelling Headphones",
        category: "Audio & Wearables",
        author: "AuraTech Audio Labs",
        updatedAt: "2026-07-10",
        relevanceScore: 0.99,
        vectorSimilarity: 0.96,
        lexicalScore: 0.94,
        snippet: "Premium over-ear wireless headphones with hybrid ANC, 45-hour battery life, custom spatial audio drivers, and lossless Bluetooth 5.4 LDAC playback.",
        fullContent: `
# AuraSound Pro X Wireless ANC Headphones

- **Price**: $299.99
- **Rating**: 4.9 / 5.0 (1,420 Reviews)
- **Key Features**:
  - Dual hybrid Active Noise Cancellation (-42dB attenuation)
  - 45 Hours playback with Fast Charge (10 mins = 5 hours)
  - Multi-point Bluetooth 5.4 with LDAC & AAC codecs
  - Ultra-soft memory foam earcups with matte titanium headband
        `,
        groundingCitations: [
          { text: "$299.99 price point with 45-hour continuous battery life and LDAC wireless audio", page: 1 }
        ],
        attributes: {
          price: "$299.99",
          inStock: true,
          rating: 4.9,
          color: "Space Gray / Matte Black"
        }
      },
      {
        id: "prod-monitor-02",
        title: "VividView 34\" UltraWide OLED Curved Ergonomic Monitor",
        category: "Monitors & Displays",
        author: "VividView Tech",
        updatedAt: "2026-06-28",
        relevanceScore: 0.94,
        vectorSimilarity: 0.92,
        lexicalScore: 0.88,
        snippet: "34-inch QD-OLED curved screen (1800R), 240Hz refresh rate, 0.03ms response time, 99.3% DCI-P3 color gamut, and 90W USB-C Power Delivery hub.",
        fullContent: `
# VividView 34" UltraWide OLED Curved Gaming & Workstation Monitor

- **Price**: $899.00
- **Rating**: 4.8 / 5.0 (890 Reviews)
- **Key Features**:
  - QD-OLED Panel with infinite contrast ratio & True Black 400
  - 240Hz Refresh rate with NVIDIA G-Sync & AMD FreeSync Premium Pro
  - Built-in ergonomic height/tilt/swivel stand
  - Single USB-C cable for 90W laptop charging + DisplayPort signal
        `,
        groundingCitations: [
          { text: "34-inch QD-OLED 240Hz curved panel with 90W USB-C power delivery", page: 1 }
        ],
        attributes: {
          price: "$899.00",
          inStock: true,
          rating: 4.8,
          color: "Midnight Black"
        }
      },
      {
        id: "prod-robot-03",
        title: "CleanBot Apex Ultra LiDAR Self-Emptying Robotic Vacuum & Mop",
        category: "Smart Home",
        author: "CleanBot Intelligent Systems",
        updatedAt: "2026-07-02",
        relevanceScore: 0.92,
        vectorSimilarity: 0.90,
        lexicalScore: 0.86,
        snippet: "Autonomous robotic vacuum with 8000Pa suction, 3D AI obstacle recognition, sonic vibrating mop, and 60-day auto-empty dust collection station.",
        fullContent: `
# CleanBot Apex Ultra LiDAR Self-Emptying Vacuum & Mop

- **Price**: $549.99
- **Rating**: 4.7 / 5.0 (2,100 Reviews)
- **Key Features**:
  - Dual-Line 3D Laser LiDAR navigation mapping
  - 8000Pa extreme hurricane suction for pet hair & carpets
  - Auto mashing mop pad wash with 130°F hot air drying station
  - Works with Alexa, Google Home, and Matter protocol
        `,
        groundingCitations: [
          { text: "8000Pa suction power with 60-day hands-free self-emptying dustbin station", page: 1 }
        ],
        attributes: {
          price: "$549.99",
          inStock: true,
          rating: 4.7,
          color: "Arctic White"
        }
      }
    ]
  },

  biomedical: {
    id: "ds-biomedical-pubmed-v3",
    name: "BioGen scientific Literature & Clinical Corpus",
    type: "PubMed & Clinical Trials Knowledgebase",
    icon: "Microscope",
    description: "Peer-reviewed Genomics, Clinical Trials, Structural Biology & Molecular Therapeutics",
    categories: ["Genomics & CRISPR", "Oncology Therapeutics", "Immunology", "Neuroscience", "Pharmacology"],
    sampleQueries: [
      "Targeted lipid nanoparticle delivery mechanisms for CRISPR-Cas9 genome editing",
      "Single-cell RNA sequencing insights into tumor microenvironment resistance",
      "Small molecule kinase inhibitors targeting EGFR T790M mutant lung cancer",
      "mRNA nanoparticle thermal stability formulations for tropical climate storage"
    ],
    documents: [
      {
        id: "bio-crispr-lnp-01",
        title: "Organ-Specific Lipid Nanoparticle Vectors for In Vivo CRISPR-Cas9 Ribonucleoprotein Delivery",
        category: "Genomics & CRISPR",
        author: "Dr. Elena Rostova et al. - Nature Biotechnology 2026",
        updatedAt: "2026-05-12",
        relevanceScore: 0.99,
        vectorSimilarity: 0.97,
        lexicalScore: 0.93,
        snippet: "Selective organ targeting (SORT) nanoparticles loaded with Cas9 RNP complexes demonstrate >85% liver hepatocytes editing efficiency with zero off-target genomic cleavage detected by Whole Genome Sequencing.",
        fullContent: `
# Organ-Specific Lipid Nanoparticle Vectors for In Vivo CRISPR-Cas9 RNP Delivery

## Abstract
Systemic delivery of gene editing tools remains a critical bottleneck in genetic medicine. We engineered ionizable cationic lipid formulations incorporating SORT lipid molecules (1,2-dioleoyl-3-trimethylammonium-propane).

### Key Clinical Findings
1. **Targeted Delivery**: Achieved high selectivity for pulmonary endothelial cells vs. splenic macrophages.
2. **Editing Potency**: 87.4% insertions/deletions (indels) observed in therapeutic mouse models of cystic fibrosis.
3. **Low Toxicity**: Serum ALT/AST biomarker levels remained baseline post-administration.
        `,
        groundingCitations: [
          { text: "SORT lipid nanoparticles achieved 87.4% tissue-specific gene editing efficiency in vivo", page: 3 },
          { text: "Whole genome sequencing confirmed non-detectable off-target genomic cleavage", page: 6 }
        ],
        attributes: {
          journal: "Nature Biotechnology",
          impactFactor: "38.2",
          studyType: "In Vivo Animal Model",
          doi: "10.1038/s41587-026-0982-x"
        }
      },
      {
        id: "bio-scrnaseq-oncology-02",
        title: "Single-Cell Transcriptomics Maps Tumor-Infiltrating T-Cell Exhaustion Pathways in NSCLC",
        category: "Oncology Therapeutics",
        author: "Harvard Medical Research Consortium - Cell 2026",
        updatedAt: "2026-06-30",
        relevanceScore: 0.96,
        vectorSimilarity: 0.93,
        lexicalScore: 0.91,
        snippet: "Single-cell RNA sequencing of 250,000 CD8+ T-cells identified TOX and TCF7 transcriptional cascades governing anti-PD-1 checkpoint immunotherapy resistance in non-small cell lung carcinoma.",
        fullContent: `
# Single-Cell Transcriptomics Maps Tumor-Infiltrating T-Cell Exhaustion Pathways in NSCLC

## Introduction
Immunotherapy checkpoint inhibitors have revolutionized lung cancer therapy, but 60% of patients develop acquired resistance.

### Methodological Insights
- **10x Genomics Chromium Platform**: Profiling of immune cell subpopulations across baseline vs. post-relapse biopsies.
- **Biomarker Discovery**: Upregulation of HAVCR2 (TIM-3) and ENTPD1 (CD39) correlates directly with terminal exhaustion phenotype.
        `,
        groundingCitations: [
          { text: "TOX transcriptional regulator controls terminal exhaustion state refractory to PD-1 blockade", page: 4 }
        ],
        attributes: {
          journal: "Cell Oncology",
          impactFactor: "45.5",
          studyType: "Human Clinical Cohort",
          doi: "10.1016/j.cell.2026.05.041"
        }
      },
      {
        id: "bio-mrna-thermostability-03",
        title: "Lyophilized mRNA Lipid Nanoparticles Stable at Room Temperature for 12 Months",
        category: "Pharmacology",
        author: "Institute for Nanomedicine - Science Translational Medicine",
        updatedAt: "2026-04-18",
        relevanceScore: 0.93,
        vectorSimilarity: 0.90,
        lexicalScore: 0.87,
        snippet: "Novel sugar-matrix freeze-drying technology maintains mRNA encapsulation integrity and translation efficiency at 25°C without ultra-cold cold chain logistics.",
        fullContent: `
# Lyophilized mRNA Lipid Nanoparticles Stable at Room Temperature for 12 Months

## Abstract
Ultra-cold storage (-80°C to -20°C) limits global distribution of mRNA therapeutics. We present a trehalose-sucrose glass matrix formulation allowing reconstitutable mRNA-LNPs to retain full biological potency at room temperature for over 365 days.
        `,
        groundingCitations: [
          { text: "Trehalose sugar matrix maintains LNP structural integrity at 25°C without cold-chain infrastructure", page: 2 }
        ],
        attributes: {
          journal: "Sci. Transl. Med.",
          impactFactor: "17.1",
          studyType: "Formulation Science",
          doi: "10.1126/scitranslmed.2026.112"
        }
      }
    ]
  }
};

export const API_SNIPPETS = {
  pythonSearch: (datastoreId, query, hybridWeight) => `
# Python Google Cloud Discovery Engine Search API Client
from google.cloud import discoveryengine_v1 as discoveryengine

def search_discovery_engine(project_id: str, location: str, data_store_id: str, query: str):
    # Initialize Client
    client = discoveryengine.SearchServiceClient()
    
    # Define Serving Config Path
    serving_config = client.serving_config_path(
        project=project_id,
        location=location,
        data_store=data_store_id,
        serving_config="default_config",
    )
    
    # Configure Hybrid Search Spec (Dense Vector vs Lexical BM25)
    embedding_spec = discoveryengine.SearchRequest.ContentSearchSpec.EmbeddingSpec(
        embedding_vectors=[
          # Custom or pre-trained Multimodal Embedding vectors
        ]
    )
    
    content_search_spec = discoveryengine.SearchRequest.ContentSearchSpec(
        snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
            max_snippet_count=3,
            return_snippet=True,
        ),
        summary_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec(
            summary_result_count=5,
            include_citations=True,
            ignore_adversarial_queries=True,
            model_prompt_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec.ModelPromptSpec(
                preamble="Synthesize a clear, authoritative response based on grounded citations."
            ),
            model_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec.ModelSpec(
                version="gemini-1.5-flash/answer_gen"
            ),
        ),
        extractive_content_spec=discoveryengine.SearchRequest.ContentSearchSpec.ExtractiveContentSpec(
            max_extractive_answer_count=1,
            max_extractive_segment_count=3,
        )
    )

    # Build Search Request
    request = discoveryengine.SearchRequest(
        serving_config=serving_config,
        query="${query}",
        page_size=10,
        content_search_spec=content_search_spec,
        query_expansion_spec=discoveryengine.SearchRequest.QueryExpansionSpec(
            condition=discoveryengine.SearchRequest.QueryExpansionSpec.Condition.AUTO
        ),
        spell_correction_spec=discoveryengine.SearchRequest.SpellCorrectionSpec(
            mode=discoveryengine.SearchRequest.SpellCorrectionSpec.Mode.AUTO
        )
    )

    # Execute Search Call
    response = client.search(request)
    
    print(f"Summary Answer: {response.summary.summary_text}")
    for result in response.results:
        print(f"Document ID: {result.document.id} | Score: {result.document.relevance_score}")
        
return search_discovery_engine("my-gcp-project", "global", "${datastoreId}", "${query}")
`,

  nodeSearch: (datastoreId, query) => `
// Node.js Google Cloud Discovery Engine Search Client
const { SearchServiceClient } = require('@google-cloud/discoveryengine').v1;

const client = new SearchServiceClient();

async function runDiscoverySearch() {
  const servingConfig = client.projectLocationDataStoreServingConfigPath(
    'my-gcp-project',
    'global',
    '${datastoreId}',
    'default_config'
  );

  const request = {
    servingConfig,
    query: '${query}',
    pageSize: 10,
    contentSearchSpec: {
      snippetSpec: { maxSnippetCount: 3, returnSnippet: true },
      summarySpec: {
        summaryResultCount: 5,
        includeCitations: true,
        modelSpec: { version: 'gemini-1.5-flash/answer_gen' }
      }
    }
  };

  const [response] = await client.search(request);
  console.log('AI Summary:', response.summary?.summaryText);
  response.results.forEach(res => {
    console.log('Result:', res.document.name, res.document.derivedStructData);
  });
}

runDiscoverySearch();
`,

  curlSearch: (datastoreId, query) => `
# REST API curl request for Vertex AI Search (Discovery Engine)
curl -X POST \\
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \\
  -H "Content-Type: application/json" \\
  "https://discoveryengine.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/global/dataStores/${datastoreId}/servingConfigs/default_config:search" \\
  -d '{
    "query": "${query}",
    "pageSize": 10,
    "contentSearchSpec": {
      "snippetSpec": {
        "maxSnippetCount": 3,
        "returnSnippet": true
      },
      "summarySpec": {
        "summaryResultCount": 5,
        "includeCitations": true
      }
    }
  }'
`
};
