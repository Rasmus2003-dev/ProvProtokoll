// Lightweight Mini-SQL database engine for ProvProtokoll Prov-system
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
  { id: 'usr-1', name: 'Rasmus Lundin', personalNumber: '19850412-1111', email: 'rasmus.lundin@provprotokoll.se', role: 'inspector', pin: '1234' }
];

const DEFAULT_TESTS: TestRow[] = [];

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

  // Question database helpers
  public getQuestionsForTest(testId: string, customQuestions?: any[], seed?: string) {
    return buildTestQuestions(testId, customQuestions, seed);
  }

  public autoCategorizeQuestion(text: string, options: string[] = []): number {
    return autoCategorizeQuestion(text, options);
  }
}

// Auto-categorize question based on Swedish traffic keywords
// 1: Fordonskännedom & manövrering, 2: Miljö, 3: Trafiksäkerhet, 4: Trafikregler, 5: Personliga förutsättningar
export function autoCategorizeQuestion(text: string, options: string[] = []): number {
  const content = (text + ' ' + options.join(' ')).toLowerCase();

  // Category 2: Miljö (Eco-driving, emissions, fuel, AdBlue, catalysator)
  if (
    content.includes('miljö') ||
    content.includes('sparsam körning') ||
    content.includes('eco-driving') ||
    content.includes('ecodriving') ||
    content.includes('bränsleförbrukning') ||
    content.includes('koldioxid') ||
    content.includes('co2') ||
    content.includes('avgas') ||
    content.includes('adblue') ||
    content.includes('katalysator') ||
    content.includes('partikelfilter') ||
    content.includes('nox')
  ) {
    return 2;
  }

  // Category 5: Personliga förutsättningar (Trötthet, alkohol, droger, sömn, stress, kör- och vilotider)
  if (
    content.includes('trötthet') ||
    content.includes('alkohol') ||
    content.includes('promille') ||
    content.includes('droger') ||
    content.includes('narkotika') ||
    content.includes('medicin') ||
    content.includes('sömn') ||
    content.includes('stress') ||
    content.includes('synskärpa') ||
    content.includes('reaktionssträcka') ||
    content.includes('reaktionstid') ||
    content.includes('psykolog') ||
    content.includes('grupptryck') ||
    content.includes('kör- och vilotider') ||
    content.includes('dygnsvila') ||
    content.includes('veckovila') ||
    content.includes('körtid') ||
    content.includes('vilotid') ||
    content.includes('ergonomi')
  ) {
    return 5;
  }

  // Category 1: Fordonskännedom & manövrering (Bromsar, tryckluft, däck, koppling, motor, vikter, el, vätskor)
  if (
    content.includes('tryckluft') ||
    content.includes('bromsar') ||
    content.includes('bromssystem') ||
    content.includes('katastrofbroms') ||
    content.includes('fjäderbroms') ||
    content.includes('färdbroms') ||
    content.includes('däck') ||
    content.includes('mönsterdjup') ||
    content.includes('bult') ||
    content.includes('bygelkoppling') ||
    content.includes('vändskiva') ||
    content.includes('duomatic') ||
    content.includes('lufttryck') ||
    content.includes('boggi') ||
    content.includes('boggie') ||
    content.includes('kultryck') ||
    content.includes('bruttovikt') ||
    content.includes('totalvikt') ||
    content.includes('tjänstevikt') ||
    content.includes('axeltryck') ||
    content.includes('dolly') ||
    content.includes('motorolja') ||
    content.includes('kylarvätska') ||
    content.includes('strålkastare') ||
    content.includes('spolarvätska') ||
    content.includes('styrning') ||
    content.includes('servostyrning') ||
    content.includes('säkring') ||
    content.includes('abs-broms')
  ) {
    return 1;
  }

  // Category 3: Trafiksäkerhet (Halka, mörker, säkerhetsavstånd, barn, olycka, bälte, hastighet, lastsäkring)
  if (
    content.includes('halka') ||
    content.includes('halkigt') ||
    content.includes('snö') ||
    content.includes('is') ||
    content.includes('vinterväglag') ||
    content.includes('vattenplaning') ||
    content.includes('mörkerkörning') ||
    content.includes('sikt') ||
    content.includes('nedsatt sikt') ||
    content.includes('säkerhetsavstånd') ||
    content.includes('tresekundersregeln') ||
    content.includes('bromssträcka') ||
    content.includes('stoppsträcka') ||
    content.includes('bilbälte') ||
    content.includes('barnstol') ||
    content.includes('krockkudde') ||
    content.includes('airbag') ||
    content.includes('lastsäkring') ||
    content.includes('spännband') ||
    content.includes('överfallssurrning') ||
    content.includes('tipprisk') ||
    content.includes('olycka') ||
    content.includes('varningstriangel') ||
    content.includes('hjärt-lungräddning') ||
    content.includes('fällkniv') ||
    content.includes('jackknif')
  ) {
    return 3;
  }

  // Category 4: Trafikregler (Vägmärken, högerregel, företräde, cirkulationsplats, parkering, motorväg, buss)
  return 4;
}

import { buildTestQuestions } from '../data/mockQuestions';

export const miniDb = new MiniSqlDb();
