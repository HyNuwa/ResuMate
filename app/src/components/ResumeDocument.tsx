import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Registrar fuentes estándar (opcional, usar Helvetica por defecto es seguro para ATS)
Font.register({
  family: 'Open Sans',
  src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf'
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica', // ATS friendly
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    marginBottom: 20,
    borderBottom: '1pt solid #000',
    paddingBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  contact: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    textTransform: 'uppercase',
    borderBottom: '1pt solid #ccc',
  },
  text: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 5,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    width: 10,
    fontSize: 11,
  },
  bulletText: {
    fontSize: 11,
    flex: 1,
  },
  keywords: {
    fontSize: 9,
    color: '#888',
    marginTop: 20,
    fontStyle: 'italic',
  }
});

interface ResumeData {
  originalText: string;
  optimizedText: string;
  keywords: string[];
}

export function ResumeDocument({ data }: { data: ResumeData }) {
  // Parsear el texto optimizado en líneas para bullets
  const bullets = data.optimizedText.split('\n').filter(line => line.trim().length > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>Candidato Optimizado</Text>
          <Text style={styles.contact}>Generado por ResuMate • ATS Ready</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experiencia Profesional Relevante</Text>
          {bullets.map((bullet, i) => (
            <View key={i} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{bullet.replace(/^[•-]\s*/, '')}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keywords Detectadas</Text>
          <Text style={styles.text}>
            {data.keywords.join(' • ')}
          </Text>
        </View>
        
        <View style={styles.section}>
            <Text style={styles.keywords}>
                Optimizado con Fórmula XYZ de Google + Anti-AI Rules
            </Text>
        </View>
      </Page>
    </Document>
  );
}
