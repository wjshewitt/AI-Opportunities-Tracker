export interface ChapterSummary {
  chapter: string;
  planSummary: string;
  govSummary: string;
}

export const CHAPTER_SUMMARIES: Record<string, ChapterSummary> = {
  '1. Compute & Infrastructure': {
    chapter: '1. Compute & Infrastructure',
    planSummary:
      'Sets out how the UK should secure sufficient AI infrastructure by combining sovereign, domestic and international compute, expanding the AI Research Resource (AIRR), allocating compute through mission-focused programme directors and using AI Growth Zones to crowd in private investment while addressing security and sustainability risks.',
    govSummary:
      'Commits to expand sovereign compute capacity by at least 20x by 2030, deliver a new state-of-the-art supercomputing facility and a long-term compute strategy, extend existing scientific compute resources and establish AI Growth Zones, starting at Culham, to accelerate data centre build-out and support national priorities.'
  },
  '2. Data Availability': {
    chapter: '2. Data Availability',
    planSummary:
      'Proposes using the National Data Library and wider data access policy to unlock high-value public and private datasets for AI, including identifying priority public datasets, shaping new data collection in strategic areas, issuing guidance on AI-ready open data, coupling compute with proprietary data and supporting the creation and curation of valuable datasets such as a copyright-cleared British media asset corpus.',
    govSummary:
      'States that government will create the National Data Library and develop wider data access policy, underpinned by strong privacy safeguards, and will take forward recommendations 7–13 to identify high-impact public datasets, develop guidance and infrastructure, and support access to public and private data for researchers and innovators.'
  },
  '3. Talent & Skills': {
    chapter: '3. Talent & Skills',
    planSummary:
      'Argues that the UK must train tens of thousands of additional AI professionals and increase its share of top global AI researchers by accurately assessing the skills gap, expanding AI-relevant higher education, improving diversity, creating alternative pathways into AI careers and strengthening lifelong learning.',
    govSummary:
      'Confirms that Skills England, the Curriculum and Assessment Review, DSIT, DfE and UKRI will take forward recommendations 14–22 by assessing AI and digital skills needs, supporting AI-related degree provision, improving diversity in the talent pipeline, developing scholarship and fellowship schemes and aligning lifelong skills policy with the demands of AI.'
  },
  '4. Safety & Regulation': {
    chapter: '4. Safety & Regulation',
    planSummary:
      'Describes a pro-innovation regulatory approach that protects citizens while enabling rapid AI development, including strengthening the AI Safety Institute, reforming the text and data mining regime, building regulator capability, using sandboxes and assurance tools and clarifying the role of the Alan Turing Institute in the wider institutional landscape.',
    govSummary:
      'Sets out that government will confirm and, where needed, legislate for the role and funding of the AI Safety Institute, consult on reforms to the UK text and data mining regime, work through sponsor departments and the Regulatory Innovation Office to build regulator AI capability, expand pro-innovation initiatives such as sandboxes, require reporting on AI innovation and support the AI assurance ecosystem and the Alan Turing Institute’s role.'
  },
  '5. Public Sector Adoption': {
    chapter: '5. Public Sector Adoption',
    planSummary:
      'Explains how AI should be embedded in delivering government missions through a “Scan → Pilot → Scale” model, smarter procurement and shared infrastructure, including AI leads for missions, horizon scanning, partnerships with vendors, rapid prototyping, a scalable AI tech stack, an AI Knowledge Hub and measures to enable public and private sectors to reinforce each other and address adoption barriers.',
    govSummary:
      'States that government will adopt the scan–pilot–scale approach across public services, appoint AI leads and sector champions, develop horizon scanning and experimentation capabilities, scope improved AI procurement and scaling services, pilot the AI Knowledge Hub, use digital government infrastructure to create opportunities for innovators and, via the Industrial Strategy, support AI adoption across key sectors and regions.'
  },
  '6. Sovereign AI': {
    chapter: '6. Sovereign AI',
    planSummary:
      'Argues that the UK should be an “AI maker” rather than an “AI taker” by securing national champions at the frontier of AI, and proposes creating a UK Sovereign AI unit with the mandate and tools to partner with private firms, deploy state levers and secure economic and strategic upside from frontier AI.',
    govSummary:
      'Confirms that government will launch a new function to strengthen the UK’s sovereign AI capabilities by partnering with frontier AI companies, using tools such as AI Growth Zones, access to high-potential public datasets, support for attracting top AI talent and collaboration with the national security community, with further details to follow in 2025.'
  }
};
