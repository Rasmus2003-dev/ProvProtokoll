import { useAppStore } from '../../../store/ProvContext';
import { AppLogo } from '../../../components/icons/AppLogo';

export function OfficialPrintLayout() {
  const { state, profile } = useAppStore();

  const isSafetyCheckRequired = ['C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE', 'BE', 'B96'].includes(state.properties.licenseType || '');
  const showSafetyCheckRow = isSafetyCheckRequired;

  const isFailed = state.result.drivingResult === 'Underkänt' || (isSafetyCheckRequired && state.result.safetyCheckResult === 'Underkänt');
  const isGodkand = state.result.drivingResult === 'Godkänt' && (!isSafetyCheckRequired || state.result.safetyCheckResult === 'Godkänt');

  let drivingResultText = state.result.drivingResult || '-';
  if (drivingResultText === 'Godkänt' && state.properties.transmission === 'Automat') {
    drivingResultText = 'Godkänt (Automat)';
  }

  // License text formatting
  let behorighetText = 'Ingen behörighet uppnådd.';
  if (isGodkand && state.properties.licenseType) {
    behorighetText = `Behörighet uppnådd: ${state.properties.licenseType}`;
  }

  const drivingFail = state.result.drivingFailure;
  const safetyFail = state.result.safetyCheckFailure;

  return (
    <div className="resultContainer" style={{ fontFamily: 'Arial, sans-serif', color: '#000', margin: '0', padding: '0', backgroundColor: '#fff', width: '100%', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
      <div>
        <table style={{ width: '100%', borderSpacing: 0 }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top', width: '220px' }}>
                <AppLogo />
              </td>
              <td></td>
            </tr>
            <tr>
              <td colSpan={3}>
                <div style={{ marginTop: '30px' }}>
                  <h1 style={{ fontSize: '24px', margin: '0 0 10px 0', fontWeight: 'bold' }}>Körprovsresultat</h1>
                  <table style={{ width: '100%', borderSpacing: 0 }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '5px 0 15px 0', width: '50%' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#555', marginBottom: '2px' }}>Namn:</div>
                          {state.properties.studentName || 'Förnamn Efternamn'}
                        </td>
                        <td style={{ padding: '5px 0 15px 0', width: '50%' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#555', marginBottom: '2px' }}>Personnummer:</div>
                          {state.properties.personalNumber || 'ÅÅMMDD-NNNN'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 0 15px 0' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#555', marginBottom: '2px' }}>Provtyp:</div>
                          Körprov {state.properties.licenseType}
                        </td>
                        <td style={{ padding: '5px 0 15px 0' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#555', marginBottom: '2px' }}>Provdatum:</div>
                          {state.properties.testDate}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ padding: '5px 0 15px 0' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#555', marginBottom: '2px' }}>Provförrättare:</div>
                          {profile?.name || 'Inspektör'}
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
      <div style={{ fontSize: '14px' }}>
        <b>Behörighetsinformation</b><br />
        {behorighetText}
      </div>
      <br />
      <div className="resultBody" style={{ fontSize: '14px' }}>
        <table style={{ borderSpacing: 0, width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ padding: '5px 0' }}><b>Prov</b></td>
              <td style={{ padding: '5px 0' }}><b>Resultat</b></td>
            </tr>
            <tr>
              <td style={{ padding: '5px 50px 5px 0' }}>Körning</td>
              <td style={{ padding: '5px 0' }}>{drivingResultText}</td>
            </tr>
            {showSafetyCheckRow && (
              <tr>
                <td style={{ padding: '5px 50px 5px 0' }}>Säkerhetskontroll</td>
                <td style={{ padding: '5px 0' }}>{state.result.safetyCheckResult || '-'}</td>
              </tr>
            )}
          </tbody>
        </table>
        <br />
        <div>
          Detta beslut får enligt 8 kap. 2 § körkortslagen (1998:488) inte överklagas.
          <br />
          Här ser du ditt resultat inom provets olika ämnesområden.
        </div>
        <br />
        
        {isFailed ? (
          <div>
            <h2 style={{ color: 'red', fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
              Din körning är underkänd.
            </h2>
            <br />
            {drivingFail?.primaryCause?.area && (
              <>
                <b>Grundorsak till underkännandet är:</b><br />
                <div style={{ border: '3px #C0504D solid', marginBottom: '10px', padding: '5px', marginTop: '5px' }}>
                  <div style={{ marginBottom: '10px' }}>{drivingFail.primaryCause.area}</div>
                  Din körning visar brister i att:
                  <ul style={{ marginTop: 0 }}>
                    {drivingFail.primaryCause.deficiencies.map((def, idx) => (
                      <li key={idx}>{def}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {drivingFail?.consequences && drivingFail.consequences.length > 0 && (
              <>
                <div style={{ marginTop: '15px' }}><b>Detta får konsekvenser på: </b></div>
                {drivingFail.consequences.map((cons, idx) => (
                  <div key={idx} style={{ border: '3px #F79646 solid', marginBottom: '10px', padding: '5px', marginTop: '5px' }}>
                    <div style={{ marginBottom: '10px' }}>{cons.area}</div>
                    Din körning visar brister i att:
                    <ul style={{ marginTop: 0 }}>
                      {cons.deficiencies.map((def, idy) => (
                        <li key={idy}>{def}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            )}

            {drivingFail?.situations && drivingFail.situations.length > 0 && (
              <div>
                <span><b>Brister har visat sig i följande situationer:</b></span>
                <ul style={{ marginTop: 0 }}>
                  {drivingFail.situations.map((sit, idx) => (
                    <li key={idx}>{sit}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {state.result.interventionOccurred && (
              <div style={{ marginTop: '15px', marginBottom: '15px', fontWeight: 'bold', color: '#C80018' }}>
                Ingripande har förekommit
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 style={{ color: 'green', fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
              Din körning är godkänd.
            </h2>
            {isSafetyCheckRequired && state.result.safetyCheckResult === 'Godkänt' && (
              <h2 style={{ color: 'green', fontSize: '20px', fontWeight: 'bold', margin: '10px 0 10px 0' }}>
                Din säkerhetskontroll är godkänd.
              </h2>
            )}
          </div>
        )}

        <br />
        <span><b>Följande provinnehåll har ingått i ditt körprov:</b></span>
        {state.includedTestItems && state.includedTestItems.length > 0 ? (
          <ul style={{ marginTop: 0, paddingLeft: '20px' }}>
            {state.includedTestItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        ) : (
          <p style={{ marginTop: '4px', fontStyle: 'italic', color: '#666' }}>Inga specifika moment registrerade.</p>
        )}

        <p style={{ marginTop: '50px' }}>
          {isFailed 
            ? <>Det är viktigt att du tränar mer innan du genomför ditt nästa körprov.<br />Välkommen åter!</> 
            : <>Stort grattis till ditt godkända körkortsprov!<br />Kör försiktigt ute på vägarna!</>}
        </p>
      </div>
    </div>
  );
}
