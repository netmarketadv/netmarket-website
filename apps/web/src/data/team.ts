const cmsUploadsBase = 'https://cms.netmarket.it/wp-content/uploads/2026/09';

export type TeamMember = {
  id: string;
  fullName: string;
  givenName: string;
  familyName: string;
  displayName: string;
  role: string;
  image: string;
  imageAlt: string;
  imageSrcSet?: string;
  imagePosition: string;
  linkedin: string;
};

export const teamMembers = [
  {
    id: 'enrico-paolo-toso',
    fullName: 'Enrico Paolo Toso',
    givenName: 'Enrico Paolo',
    familyName: 'Toso',
    displayName: 'Enrico',
    role: 'Digital Developer',
    image: `${cmsUploadsBase}/enrico-toso-digital-developer-netmarket.jpg`,
    imageAlt: 'Ritratto di Enrico Paolo Toso',
    imagePosition: '50% 34%',
    linkedin: 'https://www.linkedin.com/in/enricopaolotoso/'
  },
  {
    id: 'mattia-graziotti',
    fullName: 'Mattia Graziotti',
    givenName: 'Mattia',
    familyName: 'Graziotti',
    displayName: 'Mattia',
    role: 'Backend Developer',
    image: `${cmsUploadsBase}/mattia-graziotti-backend-developer-netmarket.jpg`,
    imageAlt: 'Ritratto di Mattia Graziotti',
    imagePosition: '50% 34%',
    linkedin: 'https://www.linkedin.com/in/mattia-graziotti-196b2bb8/'
  },
  {
    id: 'greta-negro',
    fullName: 'Greta Negro',
    givenName: 'Greta',
    familyName: 'Negro',
    displayName: 'Greta',
    role: 'Graphic Designer',
    image: `${cmsUploadsBase}/greta-negro-graphic-designer-netmarket.jpg`,
    imageAlt: 'Ritratto di Greta Negro',
    imagePosition: '50% 34%',
    linkedin: 'https://www.linkedin.com/in/greta-negro-/'
  },
  {
    id: 'giacomo-galanti',
    fullName: 'Giacomo Galanti',
    givenName: 'Giacomo',
    familyName: 'Galanti',
    displayName: 'Giacomo',
    role: 'Digital Marketing Specialist',
    image: `${cmsUploadsBase}/giacomo-galanti-digital-marketing-specialist-netmarket.jpg`,
    imageAlt: 'Ritratto di Giacomo Galanti',
    imagePosition: '50% 34%',
    linkedin: 'https://www.linkedin.com/in/giacomo-galanti-in/'
  },
  {
    id: 'marco-toso',
    fullName: 'Marco Toso',
    givenName: 'Marco',
    familyName: 'Toso',
    displayName: 'Marco',
    role: 'Amministratore',
    image: `${cmsUploadsBase}/marco-toso-amministratore-netmarket.jpg`,
    imageAlt: 'Ritratto di Marco Toso',
    imagePosition: '50% 34%',
    linkedin: 'https://www.linkedin.com/in/marco-toso-4341383b/'
  }
] satisfies TeamMember[];
