import { Page, Text, View, Document, StyleSheet, Font, Link } from '@react-pdf/renderer';
import type { ResumeData } from '@resumate/schema';

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2', fontWeight: 700 },
  ],
});

const BASE_FONT = 'Helvetica';

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

const styles = StyleSheet.create({
  page: {
    fontFamily: BASE_FONT,
    fontSize: 10,
    padding: '40pt 45pt',
    color: '#1a1a1a',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headline: {
    fontSize: 11,
    color: '#555',
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    fontSize: 9,
    color: '#666',
    marginBottom: 12,
  },
  contactItem: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#2563eb',
    borderBottom: '0.5pt solid #2563eb',
    paddingBottom: 2,
    marginTop: 10,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
    marginBottom: 4,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  entrySubtitle: {
    fontSize: 9,
    color: '#555',
  },
  entryPeriod: {
    fontSize: 9,
    color: '#888',
    fontStyle: 'italic',
  },
  entryDescription: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#374151',
    marginTop: 2,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  skillTag: {
    fontSize: 8,
    backgroundColor: '#f3f4f6',
    padding: '2pt 4pt',
    borderRadius: 2,
  },
  skillName: {
    fontSize: 9,
  },
  languagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  langItem: {
    fontSize: 9,
  },
});

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function ContactRow({ basics }: { basics: ResumeData['basics'] }) {
  const items = [
    basics.email,
    basics.phone,
    basics.location,
    basics.website?.url,
  ].filter(Boolean);

  return (
    <View style={styles.contactRow}>
      {items.map((item, i) => (
        <Text key={i} style={styles.contactItem}>{item}</Text>
      ))}
    </View>
  );
}

function SummarySection({ summary }: { summary: ResumeData['summary'] }) {
  if (summary.hidden || !summary.content) return null;
  return (
    <View>
      <SectionTitle title={summary.title || 'Summary'} />
      <Text style={styles.summaryText}>{stripHtml(summary.content)}</Text>
    </View>
  );
}

function ExperienceSection({ section }: { section: ResumeData['sections']['experience'] }) {
  if (section.hidden || section.items.length === 0) return null;
  return (
    <View>
      <SectionTitle title={section.title || 'Experience'} />
      {section.items.map(item => (
        <View key={item.id} style={{ marginBottom: 8 }}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>
              {item.position}{item.company ? ` — ${item.company}` : ''}
            </Text>
            {item.period && <Text style={styles.entryPeriod}>{item.period}</Text>}
          </View>
          {item.location && <Text style={styles.entrySubtitle}>{item.location}</Text>}
          {item.description && (
            <Text style={styles.entryDescription}>{stripHtml(item.description)}</Text>
          )}
          {item.roles?.map(role => (
            <View key={role.id} style={{ marginTop: 3, paddingLeft: 8 }}>
              <Text style={styles.entrySubtitle}>{role.position}{role.period ? ` (${role.period})` : ''}</Text>
              {role.description && (
                <Text style={styles.entryDescription}>{stripHtml(role.description)}</Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function EducationSection({ section }: { section: ResumeData['sections']['education'] }) {
  if (section.hidden || section.items.length === 0) return null;
  return (
    <View>
      <SectionTitle title={section.title || 'Education'} />
      {section.items.map(item => (
        <View key={item.id} style={{ marginBottom: 6 }}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>{item.school}</Text>
            {item.period && <Text style={styles.entryPeriod}>{item.period}</Text>}
          </View>
          <Text style={styles.entrySubtitle}>
            {[item.degree, item.area, item.grade].filter(Boolean).join(' • ')}
          </Text>
          {item.description && (
            <Text style={styles.entryDescription}>{stripHtml(item.description)}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

function SkillsSection({ section }: { section: ResumeData['sections']['skills'] }) {
  if (section.hidden || section.items.length === 0) return null;
  return (
    <View>
      <SectionTitle title={section.title || 'Skills'} />
      <View style={styles.skillsRow}>
        {section.items.map(item => (
          <Text key={item.id} style={styles.skillTag}>
            <Text style={styles.skillName}>{item.name}</Text>
            {item.keywords?.length > 0 && ` — ${item.keywords.join(', ')}`}
          </Text>
        ))}
      </View>
    </View>
  );
}

function LanguagesSection({ section }: { section: ResumeData['sections']['languages'] }) {
  if (section.hidden || section.items.length === 0) return null;
  return (
    <View>
      <SectionTitle title={section.title || 'Languages'} />
      <View style={styles.languagesGrid}>
        {section.items.map(item => (
          <Text key={item.id} style={styles.langItem}>
            {item.language}{item.fluency ? ` (${item.fluency})` : ''}
          </Text>
        ))}
      </View>
    </View>
  );
}

function CertificationsSection({ section }: { section: ResumeData['sections']['certifications'] }) {
  if (section.hidden || section.items.length === 0) return null;
  return (
    <View>
      <SectionTitle title={section.title || 'Certifications'} />
      {section.items.map(item => (
        <View key={item.id} style={{ marginBottom: 5 }}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>{item.title}</Text>
            {item.date && <Text style={styles.entryPeriod}>{item.date}</Text>}
          </View>
          {item.issuer && <Text style={styles.entrySubtitle}>{item.issuer}</Text>}
          {item.description && (
            <Text style={styles.entryDescription}>{stripHtml(item.description)}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

function ProjectsSection({ section }: { section: ResumeData['sections']['projects'] }) {
  if (section.hidden || section.items.length === 0) return null;
  return (
    <View>
      <SectionTitle title={section.title || 'Projects'} />
      {section.items.map(item => (
        <View key={item.id} style={{ marginBottom: 5 }}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>{item.name}</Text>
            {item.period && <Text style={styles.entryPeriod}>{item.period}</Text>}
          </View>
          {item.website?.url && (
            <Link src={item.website.url} style={{ fontSize: 8, color: '#2563eb' }}>
              {item.website.label || item.website.url}
            </Link>
          )}
          {item.description && (
            <Text style={styles.entryDescription}>{stripHtml(item.description)}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

function AwardsSection({ section }: { section: ResumeData['sections']['awards'] }) {
  if (section.hidden || section.items.length === 0) return null;
  return (
    <View>
      <SectionTitle title={section.title || 'Awards'} />
      {section.items.map(item => (
        <View key={item.id} style={{ marginBottom: 5 }}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>{item.title}</Text>
            {item.date && <Text style={styles.entryPeriod}>{item.date}</Text>}
          </View>
          {item.awarder && <Text style={styles.entrySubtitle}>{item.awarder}</Text>}
          {item.description && (
            <Text style={styles.entryDescription}>{stripHtml(item.description)}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

function VolunteerSection({ section }: { section: ResumeData['sections']['volunteer'] }) {
  if (section.hidden || section.items.length === 0) return null;
  return (
    <View>
      <SectionTitle title={section.title || 'Volunteer'} />
      {section.items.map(item => (
        <View key={item.id} style={{ marginBottom: 5 }}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>{item.organization}</Text>
            {item.period && <Text style={styles.entryPeriod}>{item.period}</Text>}
          </View>
          {item.location && <Text style={styles.entrySubtitle}>{item.location}</Text>}
          {item.description && (
            <Text style={styles.entryDescription}>{stripHtml(item.description)}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

function PublicationsSection({ section }: { section: ResumeData['sections']['publications'] }) {
  if (section.hidden || section.items.length === 0) return null;
  return (
    <View>
      <SectionTitle title={section.title || 'Publications'} />
      {section.items.map(item => (
        <View key={item.id} style={{ marginBottom: 5 }}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>{item.title}</Text>
            {item.date && <Text style={styles.entryPeriod}>{item.date}</Text>}
          </View>
          {item.publisher && <Text style={styles.entrySubtitle}>{item.publisher}</Text>}
          {item.description && (
            <Text style={styles.entryDescription}>{stripHtml(item.description)}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

export function ResumePDFDocument({ resume }: { resume: ResumeData }) {
  const { basics, summary, sections } = resume;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {basics.name && (
          <Text style={styles.name}>{basics.name.toUpperCase()}</Text>
        )}
        {basics.headline && (
          <Text style={styles.headline}>{basics.headline}</Text>
        )}
        <ContactRow basics={basics} />
        <SummarySection summary={summary} />
        <ExperienceSection section={sections.experience} />
        <EducationSection section={sections.education} />
        <SkillsSection section={sections.skills} />
        <LanguagesSection section={sections.languages} />
        <CertificationsSection section={sections.certifications} />
        <ProjectsSection section={sections.projects} />
        <AwardsSection section={sections.awards} />
        <VolunteerSection section={sections.volunteer} />
        <PublicationsSection section={sections.publications} />
      </Page>
    </Document>
  );
}
