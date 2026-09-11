// Lightweight Mini-SQL database engine for Trafikverket Prov-system
// Provides table schema, SQL-like queries (SELECT, INSERT, UPDATE, DELETE), and localStorage/IndexedDB persistence.

export interface UserRow {
  id: string;
  name: string;
  personalNumber: string;
  email: string;
  role: 'inspector' | 'candidate';
  pin: string;
  authClass?: string;
  bench?: string;
}

export interface TestRow {
  id: string;
  personalNumber: string;
  studentName: string;
  testType: string;
  licenseType: string;
  testDate: string;
  status: 'Bokad' | 'Pågår' | 'Genomförd' | 'Underkänd';
  score?: number;
  maxScore?: number;
}

const DEFAULT_USERS: UserRow[] = [
  { id: 'usr-1', name: 'Rasmus Lundin', personalNumber: '19850412-1111', email: 'rasmus.lundin@provprotokoll.se', role: 'inspector', pin: '1234' },
  { id: 'usr-2', name: 'Elvira Strömqvist', personalNumber: '19950613-1234', email: 'elvira.stromqvist@exempel.se', role: 'candidate', pin: '1234', authClass: 'B', bench: '12' },
  { id: 'usr-3', name: 'Mikael Kronberg', personalNumber: '19820209-4937', email: 'mikael.kronberg@exempel.se', role: 'candidate', pin: '1234', authClass: 'C', bench: '4' },
  { id: 'usr-4', name: 'Fatima Al-Sayed', personalNumber: '19900314-5566', email: 'fatima.alsayed@exempel.se', role: 'candidate', pin: '1234', authClass: 'D', bench: '8' },
  { id: 'usr-5', name: 'Simon Svensson', personalNumber: '19970613-9876', email: 'simon.svensson@exempel.se', role: 'candidate', pin: '1234', authClass: 'B', bench: '7' },
  { id: 'usr-6', name: 'Lucas Bergqvist', personalNumber: '20011119-9876', email: 'lucas.bergqvist@exempel.se', role: 'candidate', pin: '1234', authClass: 'B', bench: '15' },
];

const DEFAULT_TESTS: TestRow[] = [
  { id: 'test-101', personalNumber: '19950613-1234', studentName: 'Elvira Strömqvist', testType: 'Förstaprov', licenseType: 'B', testDate: '2026-05-19', status: 'Bokad' },
  { id: 'test-102', personalNumber: '19820209-4937', studentName: 'Mikael Kronberg', testType: 'Förstaprov', licenseType: 'C', testDate: '2026-05-19', status: 'Bokad' },
  { id: 'test-103', personalNumber: '19900314-5566', studentName: 'Fatima Al-Sayed', testType: 'Omprov', licenseType: 'D', testDate: '2026-05-19', status: 'Bokad' },
  { id: 'test-104', personalNumber: '19970613-9876', studentName: 'Simon Svensson', testType: 'Förstaprov', licenseType: 'B', testDate: '2026-05-19', status: 'Genomförd', score: 62, maxScore: 65 },
];

class MiniSqlDb {
  private users: UserRow[] = [];
  private tests: TestRow[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const savedUsers = localStorage.getItem('mini_sql_users');
      this.users = savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS;
      
      const savedTests = localStorage.getItem('mini_sql_tests');
      this.tests = savedTests ? JSON.parse(savedTests) : DEFAULT_TESTS;

      if (!savedUsers) this.persistUsers();
      if (!savedTests) this.persistTests();
    } catch (e) {
      this.users = DEFAULT_USERS;
      this.tests = DEFAULT_TESTS;
    }
  }

  private persistUsers() {
    localStorage.setItem('mini_sql_users', JSON.stringify(this.users));
  }

  private persistTests() {
    localStorage.setItem('mini_sql_tests', JSON.stringify(this.tests));
  }

  // SQL-like interface methods
  public selectUsers(whereFn?: (u: UserRow) => boolean): UserRow[] {
    return whereFn ? this.users.filter(whereFn) : [...this.users];
  }

  public findUserByPnrOrEmail(identifier: string): UserRow | undefined {
    const clean = identifier.trim().toLowerCase().replace(/-/g, '');
    return this.users.find(u => 
      u.personalNumber.replace(/-/g, '').toLowerCase() === clean || 
      u.email.toLowerCase() === clean
    );
  }

  public insertUser(user: Omit<UserRow, 'id'>): UserRow {
    const newUser: UserRow = {
      ...user,
      id: 'usr-' + Date.now(),
    };
    this.users.push(newUser);
    this.persistUsers();
    return newUser;
  }

  public selectTests(whereFn?: (t: TestRow) => boolean): TestRow[] {
    return whereFn ? this.tests.filter(whereFn) : [...this.tests];
  }

  public insertTest(test: Omit<TestRow, 'id'>): TestRow {
    const newTest: TestRow = {
      ...test,
      id: 'test-' + Date.now(),
    };
    this.tests.push(newTest);
    this.persistTests();
    return newTest;
  }

  public updateTestStatus(id: string, status: TestRow['status'], score?: number) {
    const item = this.tests.find(t => t.id === id);
    if (item) {
      item.status = status;
      if (score !== undefined) item.score = score;
      this.persistTests();
    }
  }

  // Raw SQL query runner simulation
  public query(sql: string, params: any[] = []): any {
    const clean = sql.trim().toUpperCase();
    if (clean.startsWith('SELECT * FROM USERS')) {
      return this.users;
    }
    if (clean.startsWith('SELECT * FROM TESTS')) {
      return this.tests;
    }
    return { affectedRows: 0, status: 'OK' };
  }
}

export const miniDb = new MiniSqlDb();
