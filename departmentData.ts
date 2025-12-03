export interface KeyPerson {
  name: string;
  role: string;
}

export interface DepartmentInfo {
  code: string;
  name: string;
  keyPeople: KeyPerson[];
}

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    code: "DSIT",
    name: "Department for Science, Innovation & Technology",
    keyPeople: [
      { name: "Peter Kyle", role: "Secretary of State" },
      { name: "Sarah Munby", role: "Permanent Secretary" }
    ]
  },
  {
    code: "DBT",
    name: "Department for Business and Trade",
    keyPeople: [
      { name: "Jonathan Reynolds", role: "Secretary of State" },
      { name: "Gareth Davies", role: "Permanent Secretary" }
    ]
  },
  {
    code: "DfE",
    name: "Department for Education",
    keyPeople: [
      { name: "Bridget Phillipson", role: "Secretary of State" },
      { name: "Susan Acland-Hood", role: "Permanent Secretary" }
    ]
  },
  {
    code: "HMT",
    name: "HM Treasury",
    keyPeople: [
      { name: "Rachel Reeves", role: "Chancellor of the Exchequer" },
      { name: "James Bowler", role: "Permanent Secretary" }
    ]
  },
  {
    code: "DCMS",
    name: "Department for Culture, Media and Sport",
    keyPeople: [
      { name: "Lisa Nandy", role: "Secretary of State" },
      { name: "Sarah Healey", role: "Permanent Secretary" }
    ]
  },
  {
    code: "Skills England",
    name: "Skills England",
    keyPeople: [
      { name: "Richard Pennycook", role: "Chair" },
      { name: "Sir David Bell", role: "Interim CEO" }
    ]
  }
];

export const getDepartmentInfo = (code: string): DepartmentInfo | undefined => {
  return DEPARTMENTS.find(d => d.code === code);
};
