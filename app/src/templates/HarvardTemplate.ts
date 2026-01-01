export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    location?: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    location: string;
    graduationDate: string;
    gpa?: string;
    honors?: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    dates: string;
    achievements: string[];
  }>;
  skills: {
    categories: Array<{
      name: string;
      items: string[];
    }>;
  };
}

export const HARVARD_TEMPLATE_MARKDOWN = `# John Smith

**Email:** johnsmith@email.com | **Phone:** (555) 123-4567  
**LinkedIn:** linkedin.com/in/johnsmith | **Location:** Boston, MA

---

## Education

**Harvard University** — Cambridge, MA  
*Bachelor of Arts in Computer Science* | May 2024  
- GPA: 3.8/4.0
- Honors: Dean's List (Fall 2021, Spring 2022, Fall 2022)
- Relevant Coursework: Data Structures, Machine Learning, Software Engineering

---

## Experience

**Software Engineering Intern** — Tech Company — San Francisco, CA  
*June 2023 - August 2023*

- Developed a new feature that increased user engagement by 25% by implementing a recommendation algorithm using Python and TensorFlow
- Improved application performance by 40% by optimizing database queries and implementing caching strategies with Redis
- Collaborated with cross-functional team of 8 engineers to deliver 5 major product features on schedule

**Research Assistant** — Harvard Computer Science Department — Cambridge, MA  
*September 2022 - May 2023*

- Conducted research on natural language processing that resulted in a published paper at ACL 2023
- Built a data processing pipeline that reduced data cleaning time by 60% using Python and pandas
- Mentored 3 undergraduate students in research methodologies and programming best practices

---

## Skills

**Programming Languages:** Python, JavaScript, TypeScript, Java, C++  
**Technologies & Frameworks:** React, Node.js, TensorFlow, PyTorch, Docker, Kubernetes  
**Tools:** Git, VS Code, Jupyter, PostgreSQL, MongoDB

---

## Leadership & Activities

**President** — Computer Science Student Association  
*September 2022 - May 2024*

- Led organization of 12+ technical workshops and networking events attended by 200+ students
- Managed budget of $15,000 and coordinated with 8 committee members

`;

export const DEFAULT_RESUME_SECTIONS = {
  personalInfo: {
    name: 'John Smith',
    email: 'johnsmith@email.com',
    phone: '(555) 123-4567',
    linkedin: 'linkedin.com/in/johnsmith',
    location: 'Boston, MA',
  },
  education: [
    {
      institution: 'Harvard University',
      degree: 'Bachelor of Arts in Computer Science',
      location: 'Cambridge, MA',
      graduationDate: 'May 2024',
      gpa: '3.8/4.0',
      honors: 'Dean\'s List (Fall 2021, Spring 2022, Fall 2022)',
    },
  ],
  experience: [
    {
      title: 'Software Engineering Intern',
      company: 'Tech Company',
      location: 'San Francisco, CA',
      dates: 'June 2023 - August 2023',
      achievements: [
        'Developed a new feature that increased user engagement by 25% by implementing a recommendation algorithm using Python and TensorFlow',
        'Improved application performance by 40% by optimizing database queries and implementing caching strategies with Redis',
        'Collaborated with cross-functional team of 8 engineers to deliver 5 major product features on schedule',
      ],
    },
  ],
  skills: {
    categories: [
      {
        name: 'Programming Languages',
        items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++'],
      },
      {
        name: 'Technologies & Frameworks',
        items: ['React', 'Node.js', 'TensorFlow', 'PyTorch', 'Docker', 'Kubernetes'],
      },
      {
        name: 'Tools',
        items: ['Git', 'VS Code', 'Jupyter', 'PostgreSQL', 'MongoDB'],
      },
    ],
  },
};
