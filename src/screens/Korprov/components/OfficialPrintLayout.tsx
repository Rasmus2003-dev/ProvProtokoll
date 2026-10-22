import { useAppStore } from '../../../store/ProvContext';
import { AppState } from '../../../types';
import provprotokollLogoImg from '../../../assets/images/provprotokoll_logo_trim.png';
import { ABORTED_TEXT, ABORTED_TITLE, abortedDrivingText, protocolTestTypeLabel, safetyCellText, collectImprovementAreas, failedSituations, isNewLayout, resultHeadings, resultTranslationLines, translationUrl } from '../../../lib/protocolLayout';

interface OfficialPrintLayoutProps {
  testState?: AppState;
}

function renderHeadingJsx(text: string) {
  if (text.includes('säkerhetskontroll')) {
    const isPassed = text.includes('godkänd');
    const punct = text.endsWith('!') ? '!' : '.';
    return (
      <>
        <span style={{ whiteSpace: 'nowrap' }}>Din säkerhetskontroll</span>{' '}
        <span style={{ whiteSpace: 'nowrap' }}>är&nbsp;{isPassed ? 'godkänd' : 'underkänd'}{punct}</span>
      </>
    );
  }
  if (text.includes('körning')) {
    const isPassed = text.includes('godkänd');
    const punct = text.endsWith('!') ? '!' : '.';
    return (
      <>
        <span style={{ whiteSpace: 'nowrap' }}>Din körning</span>{' '}
        <span style={{ whiteSpace: 'nowrap' }}>är&nbsp;{isPassed ? 'godkänd' : 'underkänd'}{punct}</span>
      </>
    );
  }
  return text;
}

export function OfficialPrintLayout({ testState }: OfficialPrintLayoutProps = {}) {
  const { state: currentState, profile } = useAppStore();
  const state = testState || currentState;

  const HEAVY_LICENSES = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];
  const isSafetyCheckRequired = [...HEAVY_LICENSES, 'BE'].includes(state.properties.licenseType || '');
  const isTaxi = (state.properties.licenseType || '') === 'TAXI';
  
  const isOmprovSakerhet = state.properties.testType === 'Omprov säkerhetskontroll';
  const isOmprovKorning = state.properties.testType === 'Omprov körning';
  const isOmprovBoth = state.properties.testType === 'Omprov' || state.properties.testType === 'Omprov säkerhetskontroll och körning';
  
  let isGodkand = false;
  let isFailed = false;
  
  if (isOmprovSakerhet) {
    if (state.result.safetyCheckResult === 'Godkänt') isGodkand = true;
    if (state.result.safetyCheckResult === 'Underkänt') isFailed = true;
  } else if (isOmprovKorning) {
    if (state.result.drivingResult === 'Godkänt') isGodkand = true;
    if (state.result.drivingResult === 'Underkänt') isFailed = true;
  } else {
    const safetyCheckPassedOrNotNeeded = !isSafetyCheckRequired || state.result.safetyCheckResult === 'Godkänt';
    const drivingPassed = state.result.drivingResult === 'Godkänt';
    
    isGodkand = drivingPassed && safetyCheckPassedOrNotNeeded;
    isFailed = state.result.drivingResult === 'Underkänt' || (isSafetyCheckRequired && state.result.safetyCheckResult === 'Underkänt');
  }

  // Ett avbrutet prov är aldrig godkänt – samma bedömning som i resultatvyn
  const isAborted = Boolean(state.result.testAborted);
  if (isAborted) {
    isFailed = true;
    isGodkand = false;
  }

  const showSafetyCheckRow = isSafetyCheckRequired && !isOmprovKorning;
  const showDrivingRow = !isOmprovSakerhet;

  let drivingResultText = state.result.drivingResult || '-';
  if (isAborted) {
    drivingResultText = abortedDrivingText(state.result.drivingResult);
  } else if (drivingResultText === 'Godkänt') {
    const details: string[] = [];
    if (state.properties.transmission === 'Automat') {
      details.push('Automat');
    }
    if (state.properties.tachograph === 'Utan färdskrivare') {
      details.push('Utan färdskrivare');
    }
    if (details.length > 0) {
      drivingResultText = `Godkänt (${details.join(', ')})`;
    }
  }

  // License text formatting
  let behorighetText = 'Ingen behörighet uppnådd.';
  const isAssessmentOnly = state.properties.testType?.includes('Testprov') || state.properties.testType?.includes('Bedömningsprov');
  
  if (isGodkand && state.properties.licenseType && !isAssessmentOnly && !isTaxi) {
    behorighetText = `Behörighet uppnådd: ${state.properties.licenseType}`;
  } else if (isAssessmentOnly || isTaxi) {
    behorighetText = 'Ingen behörighet uppnådd.';
  }

  const drivingFail = state.result.drivingFailure;
  const safetyFail = state.result.safetyCheckFailure;
  const allSituations = failedSituations(state);

  const newLayout = isNewLayout(state);
  const improvementAreas = collectImprovementAreas(state);

  const testTypeLabel = protocolTestTypeLabel(state.properties.licenseType, state.properties.testType);

  return (
    <div 
      className="resultContainer bg-white dark:bg-slate-950 text-black dark:text-slate-200 print:bg-white print:text-black" 
      style={{ 
        width: '100%', 
        maxWidth: '800px', 
        margin: '0 auto', 
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '15px',
        lineHeight: '1.5'
      }}
    >
      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top', width: '220px' }}>
                <img 
                  className="logo" 
                  src={provprotokollLogoImg} 
                  alt="ProvProtokoll - Digital Provhantering" 
                  style={{ maxHeight: '92px', maxWidth: '200px', objectFit: 'contain', display: 'block' }}
                />
              </td>
              <td></td>
              <td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                <div className="print">
                  <a 
                    href="javascript:window.print()" 
                    style={{ color: '#0066cc', textDecoration: 'underline', fontSize: '13px' }}
                  >
                    Skriv ut
                  </a>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3}>
                <div style={{ marginTop: '30px' }}>
                  <h1 style={{ fontSize: '28px', margin: '0 0 16px 0', fontWeight: 'bold' }}>
                    Körprovsresultat
                  </h1>
                  <table className="infoTable" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '4px 20px 4px 0', verticalAlign: 'top', width: '50%' }}>
                          <div className="resultHeaderLabel" style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                            Namn:
                          </div>
                          <div>{state.properties.studentName || 'Förnamn Efternamn'}</div>
                        </td>
                        <td style={{ padding: '4px 0', verticalAlign: 'top', width: '50%' }}>
                          <div className="resultHeaderLabel" style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                            Personnummer:
                          </div>
                          <div>{state.properties.personalNumber || '19820209-4937'}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 20px 4px 0', verticalAlign: 'top' }}>
                          <div className="resultHeaderLabel" style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                            Provtyp:
                          </div>
                          <div>{testTypeLabel}</div>
                        </td>
                        <td style={{ padding: '4px 0', verticalAlign: 'top' }}>
                          <div className="resultHeaderLabel" style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                            Provdatum:
                          </div>
                          <div>{state.properties.testDate || new Date().toISOString().split('T')[0]}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 20px 4px 0', verticalAlign: 'top' }}>
                          <div className="resultHeaderLabel" style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                            Provförrättare:
                          </div>
                          <div>{state.properties.examiner?.trim() || profile?.name || 'Hans Eriksson'}</div>
                        </td>
                        <td style={{ padding: '4px 20px 4px 0', verticalAlign: 'top' }}>
                          {/* Tunga prov utan färdskrivare markeras här */}
                          {['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'].includes(state.properties.licenseType) && state.properties.tachograph === 'Utan färdskrivare' && (
                            <>
                              <div className="resultHeaderLabel" style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                                Färdskrivare:
                              </div>
                              <div><b>Utan färdskrivare</b></div>
                            </>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <br />
      <div>
        <b>Behörighetsinformation</b><br />
        {behorighetText}
      </div>
      <br />

      <div className="resultBody">
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ paddingRight: '50px', paddingBottom: '4px' }}>
                <b>Prov</b>
              </td>
              <td style={{ paddingBottom: '4px' }}>
                <b>Resultat</b>
              </td>
            </tr>
            {showDrivingRow && (
              <tr>
                <td style={{ paddingRight: '50px', paddingBottom: '3px' }}>
                  Körning
                </td>
                <td style={{ paddingBottom: '3px' }}>
                  {drivingResultText}
                </td>
              </tr>
            )}
            {showSafetyCheckRow && (
              <tr>
                <td style={{ paddingRight: '50px', paddingBottom: '3px' }}>
                  Säkerhetskontroll
                </td>
                <td style={{ paddingBottom: '3px' }}>
                  {safetyCellText(state)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <br />
        <div>
          {isTaxi 
            ? 'Detta beslut grundas på taxitrafiklagen (2012:211) och taxitrafikförordningen (2012:238).'
            : 'Detta beslut får enligt 8 kap. 2 § körkortslagen (1998:488) inte överklagas.'
          }
          <br />
          Här ser du ditt resultat inom provets olika ämnesområden.
          {/* Gamla layouten: Translation direkt under lagtexten, som i Trafikverkets mejl */}
          {!newLayout && (
            <div className="translate print:hidden">
              <br />
              <a
                href={translationUrl([
                  isTaxi
                    ? 'Detta beslut grundas på taxitrafiklagen (2012:211) och taxitrafikförordningen (2012:238).'
                    : 'Detta beslut får enligt 8 kap. 2 § körkortslagen (1998:488) inte överklagas.',
                  'Här ser du ditt resultat inom provets olika ämnesområden.',
                ])}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0066cc', textDecoration: 'underline' }}
              >
                Translation
              </a>
            </div>
          )}
        </div>
        <br />

        {/* Avbrutet prov */}
        {isAborted && (
          <div style={{ borderLeft: '4px solid #c40000', background: '#fdf1f1', color: '#111', padding: '10px 14px', margin: '0 0 18px' }}>
            <b style={{ color: '#a00000' }}>{ABORTED_TITLE}</b><br />
            {ABORTED_TEXT}
          </div>
        )}

        {/* Huvudrubrik för beslut */}
        {newLayout ? (
          <div>
            {resultHeadings(state).map(h => (
              <h2 key={h.text} style={{ color: h.passed ? 'green' : 'red', fontSize: '20px', margin: '0 0 14px 0', fontWeight: 'bold', lineHeight: 1.35 }}>
                {renderHeadingJsx(h.text)}
              </h2>
            ))}

            {/* Orsaker till underkännandet – alla kompetensområden i en ram */}
            {improvementAreas.length > 0 && (
              <>
                <b>Orsaker till underkännandet:</b>
                <div style={{ border: '3px solid currentColor', padding: '8px 14px 4px', margin: '6px 0 18px' }}>
                  <b>Du måste bli bättre på:</b>
                  <ul style={{ margin: '4px 0 10px', paddingLeft: '28px', listStyleType: 'disc' }}>
                    {improvementAreas.map(entry => (
                      <li key={entry.area} style={{ marginBottom: '4px', display: 'list-item' }}>
                        {/* Grundorsaken står först, i fetstil */}
                        {entry.isPrimary ? (
                          <b>{entry.area}</b>
                        ) : entry.area}
                        {entry.deficiencies.map(def => (
                          <div key={def} style={{ paddingLeft: '48px' }}>- {def}</div>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {allSituations.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <b>Du har visat brister i dessa situationer:</b>
                <ul style={{ marginTop: '4px', paddingLeft: '18px', listStyleType: 'disc' }}>
                  {allSituations.map(sit => <li key={sit} style={{ marginBottom: '2px' }}>{sit}</li>)}
                </ul>
              </div>
            )}

            {state.result.interventionOccurred && (
              (state.result.interventionSituations?.length ?? 0) > 0 ? (
                <div style={{ marginBottom: '14px' }}>
                  <b>Ingripande har skett i följande situationer:</b>
                  <ul style={{ marginTop: '4px', paddingLeft: '18px', listStyleType: 'disc' }}>
                    {state.result.interventionSituations!.map(sit => <li key={sit} style={{ marginBottom: '2px' }}>{sit}</li>)}
                  </ul>
                </div>
              ) : (
                <div style={{ marginBottom: '14px' }}>Ingripande har förekommit.</div>
              )
            )}
          </div>
        ) : isFailed ? (
          <div>
            {!isOmprovSakerhet && !isAborted && state.result.drivingResult === 'Godkänt' && (
              <h2 style={{ color: 'green', fontSize: '20px', margin: '0 0 14px 0', fontWeight: 'bold', lineHeight: 1.35 }}>
                {renderHeadingJsx('Din körning är godkänd.')}
              </h2>
            )}
            {!isOmprovSakerhet && state.result.drivingResult === 'Underkänt' && (
              <h2 style={{ color: 'red', fontSize: '20px', margin: '0 0 14px 0', fontWeight: 'bold', lineHeight: 1.35 }}>
                {renderHeadingJsx('Din körning är underkänd.')}
              </h2>
            )}
            {isSafetyCheckRequired && !isOmprovKorning && state.result.drivingResult !== 'Underkänt' && state.result.safetyCheckResult === 'Underkänt' && (
              <h2 style={{ color: 'red', fontSize: '20px', margin: '0 0 14px 0', fontWeight: 'bold', lineHeight: 1.35 }}>
                {renderHeadingJsx('Din säkerhetskontroll är underkänd.')}
              </h2>
            )}

            {/* Grundorsak med exakt 3px #C0504D ram - Körning */}
            {drivingFail?.primaryCause?.area && state.result.drivingResult === 'Underkänt' && (
              <>
                <b>Grundorsak till underkännandet är:</b><br />
                <div style={{ border: '3px #C0504D solid', marginBottom: '10px', padding: '5px', marginTop: '5px' }}>
                  <div style={{ marginBottom: '10px' }}>{drivingFail.primaryCause.area}</div>
                  Din körning visar brister i att:
                  <ul style={{ marginTop: 0, paddingLeft: '20px', listStyleType: 'disc', listStyle: 'disc' }}>
                    {drivingFail.primaryCause.deficiencies.map((def, idx) => (
                      <li key={idx} style={{ listStyleType: 'disc', display: 'list-item' }}>{def}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Konsekvenser med exakt 3px #F79646 ram - Körning */}
            {drivingFail?.consequences && drivingFail.consequences.length > 0 && state.result.drivingResult === 'Underkänt' && (
              <>
                <div style={{ marginTop: '15px' }}><b>Detta får konsekvenser på: </b></div>
                {drivingFail.consequences.map((cons, idx) => (
                  <div key={idx} style={{ border: '3px #F79646 solid', marginBottom: '10px', padding: '5px', marginTop: '5px' }}>
                    <div style={{ marginBottom: '10px' }}>{cons.area}</div>
                    Din körning visar brister i att:
                    <ul style={{ marginTop: 0, paddingLeft: '20px', listStyleType: 'disc', listStyle: 'disc' }}>
                      {cons.deficiencies.map((def, idy) => (
                        <li key={idy} style={{ listStyleType: 'disc', display: 'list-item' }}>{def}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            )}

            {/* Säkerhetskontroll underkännande om relevant */}
            {isSafetyCheckRequired && (isOmprovSakerhet || state.result.drivingResult !== 'Underkänt') && safetyFail?.primaryCause?.area && state.result.safetyCheckResult === 'Underkänt' && (
              <>
                <div style={{ marginTop: '15px' }}>
                  <b>{state.result.drivingResult === 'Underkänt' ? 'Grundorsak till säkerhetskontrollens underkännande är:' : 'Grundorsak till underkännandet är:'}</b>
                </div>
                <div style={{ border: '3px #C0504D solid', marginBottom: '10px', padding: '6px 10px', marginTop: '5px' }}>
                  <div style={{ marginBottom: '6px', fontWeight: 800, fontSize: '14px', color: '#111' }}>{safetyFail.primaryCause.area}</div>
                  <ul style={{ marginTop: 0, paddingLeft: '20px', listStyleType: 'disc', listStyle: 'disc' }}>
                    {safetyFail.primaryCause.deficiencies.map((def, idx) => (
                      <li key={idx} style={{ listStyleType: 'disc', display: 'list-item' }}>{def}</li>
                    ))}
                  </ul>
                </div>

                {safetyFail?.consequences && safetyFail.consequences.length > 0 && (
                  <>
                    <div style={{ marginTop: '15px' }}><b>Detta får konsekvenser på: </b></div>
                    {safetyFail.consequences.map((cons, idx) => (
                      <div key={idx} style={{ border: '3px #F79646 solid', marginBottom: '10px', padding: '6px 10px', marginTop: '5px' }}>
                        <div style={{ marginBottom: '6px', fontWeight: 800, fontSize: '14px', color: '#111' }}>{cons.area}</div>
                        <ul style={{ marginTop: 0, paddingLeft: '20px', listStyleType: 'disc', listStyle: 'disc' }}>
                          {cons.deficiencies.map((def, idy) => (
                            <li key={idy} style={{ listStyleType: 'disc', display: 'list-item' }}>{def}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}

            {/* Brister har visat sig i följande situationer */}
            {allSituations.length > 0 && (
              <div>
                <span><b>Brister har visat sig i följande situationer:</b></span>
                <ul style={{ marginTop: '4px', paddingLeft: '18px', listStyleType: 'disc' }}>
                  {allSituations.map((sit, idx) => (
                    <li key={idx} style={{ marginBottom: '2px' }}>
                      {sit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {state.result.interventionOccurred && (
              (state.result.interventionSituations?.length ?? 0) > 0 ? (
                <div style={{ marginTop: '10px' }}>
                  <span><b>Ingripande har skett i följande situationer:</b></span>
                  <ul style={{ marginTop: '4px', paddingLeft: '18px', listStyleType: 'disc' }}>
                    {state.result.interventionSituations!.map((sit, idx) => (
                      <li key={idx} style={{ marginBottom: '2px' }}>
                        {sit}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                  Ingripande har förekommit.
                </div>
              )
            )}
          </div>
        ) : (
          <div>
            {!isOmprovSakerhet && state.result.drivingResult === 'Godkänt' && (
              <h2 style={{ color: 'green', fontSize: '20px', margin: '0 0 14px 0', fontWeight: 'bold', lineHeight: 1.35 }}>
                {renderHeadingJsx('Din körning är godkänd.')}
              </h2>
            )}
            {isSafetyCheckRequired && state.result.safetyCheckResult === 'Godkänt' && (
              <h2 style={{ color: 'green', fontSize: '20px', margin: '10px 0', fontWeight: 'bold', lineHeight: 1.35 }}>
                {renderHeadingJsx('Din säkerhetskontroll är godkänd.')}
              </h2>
            )}
          </div>
        )}

        <br />

        {/* Följande provinnehåll har ingått i ditt körprov */}
        <span><b>{newLayout ? 'Detta bedömdes i ditt körprov:' : 'Följande provinnehåll har ingått i ditt körprov:'}</b></span>
        {state.includedTestItems && state.includedTestItems.length > 0 ? (
          <ul style={{ marginTop: '4px', paddingLeft: '18px', listStyleType: 'disc' }}>
            {state.includedTestItems.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '2px' }}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ marginTop: 0, fontStyle: 'italic' }}>Inga provmoment har registrerats.</p>
        )}

        {isFailed ? (
          <p style={{ marginTop: '50px' }}>
            {isTaxi 
              ? <>Du uppfyllde inte kraven för godkänt taxiförarprov enligt taxitrafiklagen (2012:211). Det är viktigt att du tränar mer innan du gör nästa prov.<br />Välkommen åter!</>
              : <>Det är viktigt att du tränar mer innan du genomför ditt nästa körprov.<br />Välkommen åter!</>
            }
          </p>
        ) : (isTaxi || isAssessmentOnly) ? (
          // Godkänt körprov: inget efter provinnehållet, som i Trafikverkets mejl
          <div style={{ marginTop: '20px' }}>
            <span><b>Vad händer nu?</b></span>
            {isTaxi ? (
              <p style={{ margin: '5px 0 0 0', lineHeight: '1.5' }}>
                Du är godkänd på taxiförarprovet och kan nu ansöka om <strong>taxiförarlegitimation</strong> hos Transportstyrelsen. Legitimationen utfärdas när övriga krav har prövats.
              </p>
            ) : (
              <p style={{ margin: '5px 0 0 0', lineHeight: '1.5' }}>
                Du är godkänd på bedömningsprovet och uppfyller kompetenskraven för körbedömning. Intyget kan bifogas en ansökan till <strong>trafiklärarutbildning</strong> eller vid prövning för <strong>förarprövar- eller inspektörsbehörighet</strong>.
              </p>
            )}
          </div>
        ) : null}

        {/* Ny layout: hela resultatet kan översättas, som i Trafikverkets protokoll */}
        {newLayout && (
          <div className="translate print:hidden" style={{ marginTop: '36px' }}>
            <a
              href={translationUrl(resultTranslationLines(
                state,
                [
                  isTaxi
                    ? 'Detta beslut grundas på taxitrafiklagen (2012:211) och taxitrafikförordningen (2012:238).'
                    : 'Detta beslut får enligt 8 kap. 2 § körkortslagen (1998:488) inte överklagas.',
                  'Här ser du ditt resultat inom provets olika ämnesområden.',
                ],
                isFailed
                  ? [isTaxi
                      ? 'Du uppfyllde inte kraven för godkänt taxiförarprov enligt taxitrafiklagen (2012:211). Det är viktigt att du tränar mer innan du gör nästa prov.'
                      : 'Det är viktigt att du tränar mer innan du genomför ditt nästa körprov.', 'Välkommen åter!']
                  : isTaxi
                    ? ['Vad händer nu?', 'Du är godkänd på taxiförarprovet och kan nu ansöka om taxiförarlegitimation hos Transportstyrelsen. Legitimationen utfärdas när övriga krav har prövats.']
                    : isAssessmentOnly
                      ? ['Vad händer nu?', 'Du är godkänd på bedömningsprovet och uppfyller kompetenskraven för körbedömning.']
                      : [],
              ))}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0066cc', textDecoration: 'underline' }}
            >
              Translation
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
