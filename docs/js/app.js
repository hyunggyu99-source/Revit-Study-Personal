/**
 * HVAC Mechanical Analysis Dashboard v4
 * - KO/EN language toggle
 * - SI/IP unit toggle
 * - Peak Loads (Cooling/Heating), Zones, Monthly, End Uses
 * - Report Compare + Zone Detail Compare (separate tabs)
 * - Searchable zone selector in zone comparison
 * - Peak load explanation panel
 * - Column info with ? icon
 */
(function () {
  'use strict';

  /* ===== State ===== */
  var reports = [];
  var charts = {};
  var peakMode = 'cooling';
  var comparePeakMode = 'cooling';
  var unitMode = 'ip';
  var lang = 'ko';

  var REPORT_COLORS = ['#3b82f6','#ef4444','#22c55e','#f59e0b','#8b5cf6','#ec4899'];
  var CATEGORY_COLORS = {
    heating:'#ef4444', cooling:'#3b82f6', interiorLighting:'#eab308',
    interiorEquipment:'#6b7280', fans:'#ec4899', pumps:'#8b5cf6',
    heatRecovery:'#f97316', exteriorLighting:'#a3e635', exteriorEquipment:'#475569'
  };

  /* ===== i18n Dictionary ===== */
  var I18N = {
    title:            { ko:'HVAC 기계설비 분석 대시보드',        en:'HVAC Mechanical Analysis Dashboard' },
    uploadTitle:      { ko:'HVAC / EnergyPlus HTML 보고서 업로드', en:'HVAC / EnergyPlus HTML Report Upload' },
    uploadDesc:       { ko:'여기에 HTML 파일을 드래그하거나 클릭하여 선택하세요', en:'Drag & drop HTML files here, or click to browse' },
    uploadHint:       { ko:'지원: K-HVAC Systems, Annual Building, Facility Component Load Summary', en:'Supports: K-HVAC Systems, Annual Building, Facility Component Load Summary' },
    reports:          { ko:'보고서',   en:'Reports' },
    addReport:        { ko:'+ 보고서 추가', en:'+ Add Report' },
    clearAll:         { ko:'전체 삭제', en:'Clear All' },
    tabPeakLoads:     { ko:'피크 부하', en:'Peak Loads' },
    tabZones:         { ko:'존',       en:'Zones' },
    tabEquipment:     { ko:'장비/사이징', en:'Equipment/Sizing' },
    tabVentilation:   { ko:'환기/외피', en:'Ventilation/Envelope' },
    tabCompare:       { ko:'보고서 비교', en:'Report Compare' },
    tabZoneCompare:   { ko:'존별 비교', en:'Zone Compare' },
    reportLabel:      { ko:'보고서:',  en:'Report:' },
    cooling:          { ko:'냉방',     en:'Cooling' },
    heating:          { ko:'난방',     en:'Heating' },
    peakChartCooling: { ko:'예상 냉방 피크 부하 구성요소', en:'Estimated Cooling Peak Load Components' },
    peakChartHeating: { ko:'예상 난방 피크 부하 구성요소', en:'Estimated Heating Peak Load Components' },
    peakTableCooling: { ko:'냉방 피크 부하 상세',         en:'Cooling Peak Load Detail' },
    peakTableHeating: { ko:'난방 피크 부하 상세',         en:'Heating Peak Load Detail' },
    legendTitle:      { ko:'하이라이트 범례',              en:'Highlight Legend' },
    legendHigh:       { ko:'주요 구성요소 (전체의 >15%)',  en:'Dominant component (>15% of total)' },
    legendMid:        { ko:'유의미 (5~15%)',               en:'Significant (5~15%)' },
    legendLow:        { ko:'미미 (<5%)',                   en:'Minor (<5%)' },
    legendZero:       { ko:'0 / 비활성',                   en:'Zero / Inactive' },
    tblLegendHigh:    { ko:'열 최댓값 — 해당 항목이 가장 큰 값',  en:'Column maximum — highest value in column' },
    tblLegendMid:     { ko:'열 합계의 15% 이상 — 유의미한 비중',  en:'>15% of column total — significant share' },
    tblLegendLow:     { ko:'작은 값',                             en:'Small value' },
    tblLegendZero:    { ko:'0 또는 해당 없음',                    en:'Zero or N/A' },
    summaryCards:     { ko:'요약',                               en:'Summary' },
    zoneChart:        { ko:'존 체적 및 벽면적 비교',       en:'Zone Volume & Wall Area Comparison' },
    zoneSummary:      { ko:'존 요약',                      en:'Zone Summary' },
    spaceSummary:     { ko:'공간 요약',                    en:'Space Summary' },
    eqCoolingCoils:   { ko:'냉방 코일',                     en:'Cooling Coils' },
    eqHeatingCoils:   { ko:'난방 코일',                     en:'Heating Coils' },
    eqFans:           { ko:'송풍기',                         en:'Fans' },
    eqPumps:          { ko:'펌프',                           en:'Pumps' },
    eqCentral:        { ko:'중앙 열원 장비',                 en:'Central Plant' },
    eqGroupTitle:     { ko:'HVAC 장비 현황',                  en:'HVAC Equipment' },
    sizingTitle:      { ko:'HVAC 용량 산정',                 en:'HVAC Sizing Summary' },
    szZoneCooling:    { ko:'존별 냉방 용량 산정',            en:'Zone Sensible Cooling Sizing' },
    szZoneHeating:    { ko:'존별 난방 용량 산정',            en:'Zone Sensible Heating Sizing' },
    szSystemAir:      { ko:'시스템 설계 풍량',               en:'System Design Air Flow Rates' },
    szCoilSizing:     { ko:'코일 용량 산정',                 en:'Coil Sizing Summary' },
    ventTitle:        { ko:'환기 및 외기 도입',              en:'Ventilation / Outdoor Air' },
    ventAvgOA:        { ko:'점유시간 평균 외기량',           en:'Average Outdoor Air During Occupied Hours' },
    ventMechByZone:   { ko:'존별 기계환기 설계값',           en:'Mechanical Ventilation Parameters by Zone' },
    ventStd621:       { ko:'ASHRAE 62.1 환기 기준',          en:'Standard 62.1 Zone Ventilation Parameters' },
    envTitle:         { ko:'건물 외피',                      en:'Building Envelope' },
    envOpaque:        { ko:'외벽 구성',                      en:'Opaque Exterior' },
    envFenestration:  { ko:'창호 성능',                      en:'Exterior Fenestration' },
    sensHeatTitle:    { ko:'현열 부하 분석',                  en:'Sensible Heat Gain Summary' },
    sensHeatCooling:  { ko:'냉방 피크 시 현열 부하 구성',    en:'Peak Cooling Sensible Heat Gain Components' },
    sensHeatHeating:  { ko:'난방 피크 시 현열 부하 구성',    en:'Peak Heating Sensible Heat Gain Components' },
    compareTitle:     { ko:'보고서 비교',                    en:'Report Comparison' },
    compareHint:      { ko:'비교를 위해 2개 이상의 보고서를 업로드하세요', en:'Upload 2 or more reports to enable comparison' },
    comparePeakCooling: { ko:'피크 부하 비교 - 냉방',       en:'Peak Load Comparison - Cooling' },
    comparePeakHeating: { ko:'피크 부하 비교 - 난방',       en:'Peak Load Comparison - Heating' },
    sideBySide:       { ko:'나란히 비교',                    en:'Side-by-Side Comparison' },
    compareElec:      { ko:'월별 전기 소비 비교',            en:'Total Monthly Electricity Comparison' },
    compareGas:       { ko:'월별 가스 소비 비교',            en:'Total Monthly Gas Comparison' },
    compareZone:      { ko:'존 총합 비교',                   en:'Zone Total Comparison' },
    zoneCompareHint:  { ko:'2개 이상의 보고서를 업로드하면 존별로 수치 차이를 비교합니다', en:'Upload 2+ reports to compare zone data side by side' },
    zoneSearchLabel:  { ko:'존 선택:',                       en:'Select Zone:' },
    zoneSearchPlaceholder: { ko:'존 이름 검색...', en:'Search zone name...' },
    allZones:         { ko:'전체 존',                        en:'All Zones' },
    footer:           { ko:'HVAC 기계설비 분석 대시보드 — 피크 부하 / 존 / 장비 / 환기 / 비교', en:'HVAC Mechanical Analysis Dashboard — Peak Loads / Zones / Equipment / Ventilation / Comparison' },
    noData:           { ko:'데이터 없음',        en:'No data available' },
    goToTable:        { ko:'테이블에서 보기',     en:'View in table' },
    goToInfo:         { ko:'설명 보기',           en:'View description' },
    noPeakData:       { ko:'피크 부하 데이터 없음', en:'No peak load data' },
    grandTotal:       { ko:'합계 부하',           en:'Grand Total Load' },
    sensInstant:      { ko:'현열 순간',           en:'Sensible Instant' },
    sensDelayed:      { ko:'현열 지연',           en:'Sensible Delayed' },
    latent:           { ko:'잠열',                en:'Latent' },
    dominantComp:     { ko:'최대 구성요소',        en:'Dominant Component' },
    dominantPct:      { ko:'최대 비율',            en:'Dominant % of Total' },
    delta:            { ko:'차이',                en:'Delta' },
    pctChange:        { ko:'변화율',              en:'% Change' },
    component:        { ko:'구성요소',             en:'Component' },
    name:             { ko:'이름',                en:'Name' },
    totalElec:        { ko:'총 전기',              en:'Total Electricity' },
    siteEnergy:       { ko:'대지 에너지',          en:'Site Energy' },
    eui:              { ko:'에너지원단위',          en:'EUI' },
    buildingArea:     { ko:'건물 면적',            en:'Building Area' },
    loaded:           { ko:'로드 완료: ',           en:'Loaded: ' },
    parseError:       { ko:'파싱 오류: ',           en:'Parse error: ' },
    uploadHtmlOnly:   { ko:'.html 또는 .htm 파일을 업로드하세요', en:'Please upload .html or .htm files' },
    timestamp:        { ko:'타임스탬프',            en:'Timestamp' },
    type:             { ko:'유형',                 en:'Type' },
    forFacility:      { ko:'대상',                 en:'For' },
    data:             { ko:'데이터',               en:'Data' },
    warnings:         { ko:'경고',                 en:'Warnings' },
    levelLabel:       { ko:'레벨:',               en:'Level:' },
    facility:         { ko:'시설 전체',            en:'Facility' },
    airloop:          { ko:'공조 시스템',           en:'AirLoop' },
    designDayNote:    { ko:'이 보고서는 설계일(Design Day) 시뮬레이션입니다. HVAC 장비 사이징 및 피크 부하 데이터가 중심입니다.',
                        en:'This report is a Design Day simulation. HVAC equipment sizing and peak load data are the focus.' },
    showColInfo:      { ko:'컬럼 설명 보기',       en:'Show column info' },
    hideColInfo:      { ko:'컬럼 설명 숨기기',     en:'Hide column info' },
    zoneDiff:         { ko:'차이',                 en:'Diff' },
    zoneDiffPct:      { ko:'변화율',               en:'% Diff' },
    metric:           { ko:'항목',                 en:'Metric' },
    peakExplainToggle:{ ko:'피크 부하 수치 해설',   en:'Peak Load Values Explained' }
  };

  /* ===== Korean Column Header Translations ===== */
  var HEADER_KO = {
    '': '이름', 'Name': '이름',
    // === Zone Summary ===
    'Area [ft2]': '면적 [ft²]',
    'Conditioned (Y/N)': '공조 여부',
    'Part of Total Floor Area (Y/N)': '전체 바닥면적 포함',
    'Volume [ft3]': '체적 [ft³]',
    'Multipliers': '배율',
    'Above Ground Gross Wall Area [ft2]': '지상 벽면적 [ft²]',
    'Underground Gross Wall Area [ft2]': '지하 벽면적 [ft²]',
    'Window Glass Area [ft2]': '창유리 면적 [ft²]',
    'Opening Area [ft2]': '개구부 면적 [ft²]',
    'Lighting [Btu/h-ft2]': '조명 밀도 [Btu/h-ft²]',
    'People [ft2 per person]': '재실 밀도 [ft²/인]',
    'Plug and Process [Btu/h-ft2]': '콘센트/장비 [Btu/h-ft²]',
    'Zone Name': '존 이름', 'Space Type': '공간 유형',
    'Radiant/Solar Enclosure Name': '복사/일사 구역명', 'Tags': '태그',
    // === Peak Load Components ===
    'Sensible - Instant [Btu/h]': '현열-순간 [Btu/h]',
    'Sensible - Delayed [Btu/h]': '현열-지연 [Btu/h]',
    'Sensible - Return Air [Btu/h]': '현열-환기 [Btu/h]',
    'Latent [Btu/h]': '잠열 [Btu/h]',
    'Total [Btu/h]': '합계 [Btu/h]',
    '%Grand Total': '전체 비율 %',
    'Related Area [ft2]': '관련 면적 [ft²]',
    'Total per Area [Btu/h-ft2]': '단위면적당 [Btu/h-ft²]',
    // === Energy ===
    'Electricity [kBtu]': '전기 [kBtu]', 'Natural Gas [kBtu]': '도시가스 [kBtu]',
    'District Cooling [kBtu]': '지역냉방 [kBtu]', 'District Heating [kBtu]': '지역난방 [kBtu]',
    'Total Energy [kBtu]': '총 에너지 [kBtu]',
    'Subcategory': '세부 분류',
    // === Central Plant (IP) ===
    'Type': '유형',
    'Reference Capacity [Btu/h]': '기준 용량 [Btu/h]',
    'Reference Efficiency [Btuh/Btuh]': '기준 효율 [COP]',
    'Rated Capacity [Btu/h]': '정격 용량 [Btu/h]',
    'Rated Efficiency [Btuh/Btuh]': '정격 효율 [COP]',
    'IPLV in SI Units [W/W]': 'IPLV [W/W]',
    'IPLV in IP Units [Btu/W-h]': 'IPLV [Btu/W-h]',
    'NPLV in SI Units [W/W]': 'NPLV [W/W]',
    'NPLV in IP Units [Btu/W-h]': 'NPLV [Btu/W-h]',
    // === Cooling Coils (IP) ===
    'Nominal Total Capacity [Btu/h]': '정격 총 용량 [Btu/h]',
    'Nominal Sensible Capacity [Btu/h]': '정격 현열 용량 [Btu/h]',
    'Nominal Latent Capacity [Btu/h]': '정격 잠열 용량 [Btu/h]',
    'Nominal Sensible Heat Ratio': '현열비 (SHR)',
    'Nominal Efficiency [Btuh/Btuh]': '정격 효율 [COP]',
    'Nominal Coil U*A Value [Btu/h-F]': '코일 UA값 [Btu/h-F]',
    'Nominal Total Capacity At Rated Conditions [Btu/h]': '정격조건 총용량 [Btu/h]',
    'Nominal Sensible Capacity At Rated Conditions [Btu/h]': '정격조건 현열용량 [Btu/h]',
    // === Cooling Coils (SI) ===
    'Nominal Total Capacity [W]': '정격 총 용량 [W]',
    'Nominal Sensible Capacity [W]': '정격 현열 용량 [W]',
    'Nominal Latent Capacity [W]': '정격 잠열 용량 [W]',
    'Nominal Efficiency [W/W]': '정격 효율 [COP]',
    'Nominal Coil U*A Value [W/C]': '코일 UA값 [W/C]',
    'Design Coil Load [W]': '설계 코일 부하 [W]',
    'Design Coil Load [Btu/h]': '설계 코일 부하 [Btu/h]',
    // === Fans (IP) ===
    'Total Efficiency [Btuh/Btuh]': '총 효율',
    'Delta Pressure [psi]': '압력차 [psi]',
    'Max Air Flow Rate [ft3/min]': '최대 풍량 [ft³/min]',
    'Rated Electricity Rate [W]': '정격 전력 [W]',
    'Rated Power Per Max Air Flow Rate [W-min/ft3]': '풍량당 전력 [W-min/ft³]',
    'Motor Heat In Air Fraction': '모터 열 방출비',
    'Fan Energy Index': '팬 에너지 지수',
    'End Use Subcategory': '용도 분류',
    'Design Day Name for Fan Sizing Peak': '팬 사이징 설계일',
    'Date/Time for Fan Sizing Peak': '팬 사이징 피크 시각',
    // === Fans (SI) ===
    'Design Maximum Air Flow Rate [m3/s]': '최대 설계 풍량 [m³/s]',
    'Rated Electric Power [W]': '정격 전력 [W]',
    'Rated Power Per Maximum Air Flow Rate [W-s/m3]': '풍량당 전력 [W-s/m³]',
    // === Pumps (IP) ===
    'Control': '제어 방식',
    'Head [ft]': '양정 [ft]',
    'Water Flow [gal/min]': '유량 [gal/min]',
    'Electricity Rate [W]': '전력 [W]',
    'Motor Efficiency [W/W]': '모터 효율',
    'End Use': '용도',
    // === Pumps (SI) ===
    'Head [pa]': '양정 [Pa]',
    'Design Volume Flow Rate [m3/s]': '설계 유량 [m³/s]',
    'Design Power Consumption [W]': '설계 소비 전력 [W]',
    'Motor Heat to Zone Fraction': '존 열 방출비',
    // === HVAC Sizing (IP) ===
    'Calculated Design Load [Btu/h]': '계산 설계 부하 [Btu/h]',
    'User Design Load [Btu/h]': '사용자 설계 부하 [Btu/h]',
    'User Design Load per Area [Btu/h-ft2]': '면적당 설계 부하 [Btu/h-ft²]',
    'Calculated Design Air Flow [ft3/min]': '계산 설계 풍량 [ft³/min]',
    'User Design Air Flow [ft3/min]': '사용자 설계 풍량 [ft³/min]',
    'Design Day Name': '설계일 이름',
    'Date/Time Of Peak {TIMESTAMP}': '피크 일시',
    'Date/Time Of Peak': '피크 일시',
    'Thermostat Setpoint Temperature at Peak Load [F]': '피크 시 설정온도 [°F]',
    'Indoor Temperature at Peak Load [F]': '피크 시 실내온도 [°F]',
    'Indoor Humidity Ratio at Peak Load [lbWater/lbDryAir]': '피크 시 실내습도비',
    'Outdoor Temperature at Peak Load [F]': '피크 시 외기온도 [°F]',
    'Outdoor Humidity Ratio at Peak Load [lbWater/lbDryAir]': '피크 시 외기습도비',
    'Minimum Outdoor Air Flow Rate [ft3/min]': '최소 외기풍량 [ft³/min]',
    'Heat Gain Rate from DOAS [Btu/h]': 'DOAS 열획득 [Btu/h]',
    // === HVAC Sizing (SI) ===
    'Calculated Design Load [W]': '계산 설계 부하 [W]',
    'User Design Load [W]': '사용자 설계 부하 [W]',
    'User Design Load per Area [W/m2]': '면적당 설계 부하 [W/m²]',
    'Calculated Design Air Flow [m3/s]': '계산 설계 풍량 [m³/s]',
    'User Design Air Flow [m3/s]': '사용자 설계 풍량 [m³/s]',
    'Temperature at Peak [C]': '피크 온도 [°C]',
    'Humidity Ratio at Peak [kgWater/kgDryAir]': '피크 습도비 [kg/kg]',
    'Floor Area [m2]': '바닥면적 [m²]',
    'Peak Load [W]': '피크 부하 [W]',
    'AirLoop Name': '공조 루프',
    // === System Air Flow ===
    'Sum of Air Terminal Maximum Heating Air Flow Rate [ft3/min]': '터미널 최대 난방풍량 합계 [ft³/min]',
    'Sum of Air Terminal Minimum Heating Air Flow Rate [ft3/min]': '터미널 최소 난방풍량 합계 [ft³/min]',
    'Sum of Air Terminal Maximum Air Flow Rate [ft3/min]': '터미널 최대 풍량 합계 [ft³/min]',
    'Calculated Heating Air Flow Rate [ft3/min]': '계산 난방풍량 [ft³/min]',
    'Calculated Cooling Air Flow Rate [ft3/min]': '계산 냉방풍량 [ft³/min]',
    // === Coil Sizing Summary (IP) ===
    'Coil Type': '코일 유형',
    'Coil Location': '코일 위치',
    'HVAC Type': 'HVAC 유형',
    'HVAC Name': 'HVAC 이름',
    'Zone Name(s)': '존 이름',
    'Coil Final Gross Total Capacity [Btu/h]': '코일 최종 총용량 [Btu/h]',
    'Coil Final Gross Sensible Capacity [Btu/h]': '코일 최종 현열용량 [Btu/h]',
    'Coil Final Reference Air Volume Flow Rate [ft3/min]': '코일 최종 기준풍량 [ft³/min]',
    'Coil Final Reference Plant Fluid Volume Flow Rate [gal/min]': '코일 최종 유량 [gal/min]',
    'Coil U-value Times Area Value [Btu/h-F]': '코일 UA값 [Btu/h-F]',
    // === Ventilation / Outdoor Air ===
    'Mechanical Ventilation [ach]': '기계환기 [회/h]',
    'Minimum Outdoor Air [m3/s]': '최소 외기량 [m³/s]',
    'Average Outdoor Air [ach]': '평균 외기 [회/h]',
    // === Envelope (IP) ===
    'Construction': '구조',
    'Reflectance': '반사율',
    'U-Factor with Film [Btu/h-ft2-F]': '열관류율(필름포함) [Btu/h-ft²-F]',
    'U-Factor no Film [Btu/h-ft2-F]': '열관류율(필름제외) [Btu/h-ft²-F]',
    'Gross Area [ft2]': '총면적 [ft²]',
    'Net Area [ft2]': '순면적 [ft²]',
    'Azimuth [deg]': '방위각 [°]',
    'Tilt [deg]': '경사각 [°]',
    // === Envelope (SI) ===
    'U-Factor with Film [W/m2-K]': '열관류율(필름포함) [W/m²-K]',
    'U-Factor no Film [W/m2-K]': '열관류율(필름제외) [W/m²-K]',
    'Gross Area [m2]': '총면적 [m²]',
    'Net Area [m2]': '순면적 [m²]',
    // === Fenestration (IP) ===
    'Glass Area [ft2]': '유리면적 [ft²]',
    'Frame Area [ft2]': '프레임면적 [ft²]',
    'Divider Area [ft2]': '분할대면적 [ft²]',
    'Glass U-Factor [Btu/h-ft2-F]': '유리 열관류율 [Btu/h-ft²-F]',
    'Glass SHGC': '유리 SHGC',
    'Glass Visible Transmittance': '유리 가시광투과율',
    'SHGC': '일사획득계수',
    'Visible Transmittance': '가시광 투과율',
    'Parent Surface': '부모 표면',
    // === Fenestration (SI) ===
    'Glass Area [m2]': '유리면적 [m²]',
    'Frame Area [m2]': '프레임면적 [m²]',
    'Glass U-Factor [W/m2-K]': '유리 열관류율 [W/m²-K]',
    // === Sensible Heat Gain ===
    'HVAC Input Sensible Air Heating [W]': 'HVAC 공기가열 [W]',
    'HVAC Input Sensible Air Cooling [W]': 'HVAC 공기냉각 [W]',
    'HVAC Input Heated Surface Heating [W]': 'HVAC 복사난방 [W]',
    'HVAC Input Cooled Surface Cooling [W]': 'HVAC 복사냉방 [W]',
    'People Sensible Heat Addition [W]': '재실자 현열 [W]',
    'Lights Sensible Heat Addition [W]': '조명 현열 [W]',
    'Equipment Sensible Heat Addition [W]': '장비 현열 [W]',
    'Window Heat Addition [W]': '창문 열획득 [W]',
    'Interzone Air Transfer Heat Addition [W]': '존간 공기이동 [W]',
    'Infiltration Heat Addition [W]': '침기 열획득 [W]',
    'Opaque Surface Conduction and Other Heat Addition [W]': '벽체전도 등 [W]'
  };

  /* ===== Column Descriptions ===== */
  var COL_DESC = {
    'Area [ft2]':                { ko:'해당 존의 바닥 면적입니다. 0이면 통로/계단실 등 면적 미산정 공간입니다.', en:'Floor area of the zone. 0 means uncalculated spaces like corridors/stairwells.' },
    'Conditioned (Y/N)':         { ko:'냉난방 공조가 적용되는 공간인지 여부입니다.', en:'Whether the zone is served by HVAC (heating/cooling).' },
    'Part of Total Floor Area (Y/N)': { ko:'전체 건물 바닥면적 계산에 포함되는지 여부입니다.', en:'Whether included in total building floor area calculations.' },
    'Volume [ft3]':              { ko:'존의 3차원 공간 체적입니다. 클수록 냉난방 부하가 커집니다.', en:'3D volume of the zone. Larger volumes require more heating/cooling.' },
    'Multipliers':               { ko:'동일 존이 반복되는 경우의 배수입니다. 1.0은 단일 존을 의미합니다.', en:'Multiplication factor for repeated identical zones. 1.0 means single zone.' },
    'Above Ground Gross Wall Area [ft2]': { ko:'지상부 외벽 총 면적입니다. 열 손실/획득에 직접 영향을 줍니다.', en:'Total above-ground exterior wall area. Directly affects heat loss/gain.' },
    'Underground Gross Wall Area [ft2]': { ko:'지하부 외벽 면적입니다. 지중 열전달에 관여합니다.', en:'Below-ground wall area. Involved in ground heat transfer.' },
    'Window Glass Area [ft2]':   { ko:'창유리 면적입니다. 넓을수록 일사 획득과 열손실이 커집니다.', en:'Window glass area. Larger area means more solar gain and heat loss.' },
    'Opening Area [ft2]':        { ko:'개구부(창문+문) 총 면적입니다.', en:'Total opening area (windows + doors).' },
    'Lighting [Btu/h-ft2]':      { ko:'단위면적당 조명 발열 밀도입니다. 높을수록 냉방 부하가 증가합니다.', en:'Lighting power density per floor area. Higher values increase cooling load.' },
    'People [ft2 per person]':   { ko:'1인당 할당 면적입니다. 값이 작을수록 밀집도가 높아 냉방 부하가 커집니다.', en:'Floor area per person. Lower values mean higher occupancy density and cooling load.' },
    'Plug and Process [Btu/h-ft2]': { ko:'단위면적당 콘센트/장비 발열 밀도입니다. 컴퓨터, 프린터 등의 내부 발열량입니다.', en:'Equipment power density. Internal heat from computers, printers, etc.' },
    'Total [Btu/h]':             { ko:'해당 구성요소의 총 부하(현열+잠열)입니다.', en:'Total load (sensible + latent) for this component.' },
    '%Grand Total':              { ko:'전체 피크 부하 대비 이 구성요소가 차지하는 비율입니다.', en:'Percentage this component contributes to the total peak load.' },
    'Sensible - Instant [Btu/h]':{ ko:'즉각적으로 실내 온도에 영향을 주는 현열 부하입니다.', en:'Sensible heat that immediately affects room temperature.' },
    'Sensible - Delayed [Btu/h]':{ ko:'건물 축열에 의해 지연되어 나타나는 현열 부하입니다.', en:'Sensible heat delayed by building thermal mass.' },
    'Latent [Btu/h]':            { ko:'습기(수증기)에 의한 잠열 부하입니다. 사람, 환기에 의해 발생합니다.', en:'Latent heat from moisture. Caused by people, ventilation.' },
    'Electricity [kBtu]':        { ko:'전기로 소비되는 에너지입니다.', en:'Energy consumed as electricity.' },
    'Natural Gas [kBtu]':        { ko:'도시가스(천연가스)로 소비되는 에너지입니다.', en:'Energy consumed as natural gas.' },
    'District Cooling [kBtu]':   { ko:'지역냉방으로 공급받는 냉방 에너지입니다.', en:'Cooling energy from district cooling system.' },
    'District Heating [kBtu]':   { ko:'지역난방으로 공급받는 난방 에너지입니다.', en:'Heating energy from district heating system.' },
    // Equipment columns
    'Nominal Capacity [W]':      { ko:'장비의 정격(명판) 용량입니다.', en:'Rated nameplate capacity of the equipment.' },
    'Nominal Efficiency [W/W]':  { ko:'정격 효율(COP)입니다. 높을수록 효율적입니다.', en:'Rated efficiency (COP). Higher is better.' },
    'Design Maximum Air Flow Rate [m3/s]': { ko:'최대 설계 풍량입니다.', en:'Maximum design airflow rate.' },
    'Rated Electric Power [W]':  { ko:'정격 전력 소비량입니다.', en:'Rated electrical power consumption.' },
    'Design Volume Flow Rate [m3/s]': { ko:'설계 유량입니다.', en:'Design volume flow rate.' },
    'Head [pa]':                 { ko:'펌프 양정(압력)입니다.', en:'Pump head pressure.' },
    'Calculated Design Air Flow [m3/s]': { ko:'계산된 설계 풍량입니다.', en:'Calculated design airflow.' },
    'User Design Air Flow [m3/s]': { ko:'사용자 지정 설계 풍량입니다.', en:'User-specified design airflow.' },
    'Peak Load [W]':             { ko:'피크 부하 값입니다.', en:'Peak load value.' },
    'Calculated Design Load [W]':{ ko:'계산된 설계 부하입니다.', en:'Calculated design load.' }
  };

  /* ===== Peak Load Explanation (KO/EN) ===== */
  var PEAK_EXPLAIN = {
    ko: [
      { title: '피크 부하란?', text: '건물이 가장 많은 냉방 또는 난방을 필요로 하는 순간의 최대 열량(Btu/h 또는 W)입니다. HVAC 장비의 용량을 결정하는 핵심 지표입니다.' },
      { title: '현열(Sensible) vs 잠열(Latent)', text: '<b>현열</b>은 온도 변화에 관련된 열(벽체 전도, 조명, 장비 발열 등)이고, <b>잠열</b>은 습기(수증기)에 의한 열입니다. 사람의 호흡, 외기 도입이 주요 잠열 원인입니다.' },
      { title: '현열-순간 vs 현열-지연', text: '<b>순간(Instant)</b>은 조명·사람·장비처럼 즉각 실내 온도를 올리는 열, <b>지연(Delayed)</b>은 벽체·바닥 축열에 의해 시차를 두고 나타나는 열입니다. 지연 부하가 크면 건물 열용량이 크다는 의미입니다.' },
      { title: '%Grand Total 읽는 법', text: '각 구성요소가 전체 피크 부하에서 차지하는 비율입니다. <b>15% 이상</b>이면 주요 부하 요인으로, 이 항목을 개선하면 장비 용량을 줄일 수 있습니다.' },
      { title: '주요 구성요소 해석', items: [
        { dt: 'People (사람)', dd: '재실자에 의한 열 발생. 사무실은 보통 5~15%를 차지합니다.', keywords: ['people'] },
        { dt: 'Lights (조명)', dd: '조명 발열. LED 전환 시 크게 줄어듭니다.', keywords: ['lights'] },
        { dt: 'Equipment (장비)', dd: '컴퓨터·프린터 등 내부 장비 발열입니다.', keywords: ['equipment'] },
        { dt: 'Roof/Wall/Window/Door', dd: '건물 외피를 통한 열 전달. 단열 성능과 창면적에 영향을 받습니다.', keywords: ['roof','exterior wall','fenestration','opaque door','window','interzone wall','interzone ceiling','other roof'] },
        { dt: 'Infiltration (침기)', dd: '틈새를 통한 외기 유입. 기밀성이 낮으면 커집니다.', keywords: ['infiltration'] },
        { dt: 'Ventilation (환기)', dd: '법규에 따른 외기 도입량. 보통 가장 큰 부하 중 하나입니다.', keywords: ['zone ventilation','doas'] },
        { dt: 'Ground Contact (지면접촉)', dd: '지하 바닥/벽을 통한 열 교환입니다.', keywords: ['ground contact'] }
      ]},
      { title: '수치가 의미하는 것', text: '예를 들어, 냉방 피크 총합이 <b>50,000 Btu/h</b>(약 14.7 kW)이면 약 4~5 냉방톤(RT) 규모의 냉방 장비가 필요합니다. 난방 피크가 <b>30,000 Btu/h</b>이면 약 8.8 kW의 보일러 용량이 필요한 수준입니다.' }
    ],
    en: [
      { title: 'What is Peak Load?', text: 'The maximum amount of heating or cooling (Btu/h or W) a building needs at any single moment. This is the key metric for sizing HVAC equipment.' },
      { title: 'Sensible vs Latent Heat', text: '<b>Sensible heat</b> relates to temperature change (wall conduction, lights, equipment). <b>Latent heat</b> comes from moisture (people breathing, outdoor air). Both must be handled by the HVAC system.' },
      { title: 'Instant vs Delayed', text: '<b>Instant</b> heat affects room temperature immediately (lights, people, equipment). <b>Delayed</b> heat comes from building thermal mass (walls, floors) with a time lag. High delayed load means the building has significant thermal mass.' },
      { title: 'Reading %Grand Total', text: 'The percentage each component contributes to total peak load. Components above <b>15%</b> are dominant factors—improving these can reduce equipment sizing.' },
      { title: 'Key Components', items: [
        { dt: 'People', dd: 'Heat from occupants. Typically 5–15% in offices.', keywords: ['people'] },
        { dt: 'Lights', dd: 'Lighting heat gain. Drops significantly with LED upgrades.', keywords: ['lights'] },
        { dt: 'Equipment', dd: 'Internal heat from computers, printers, etc.', keywords: ['equipment'] },
        { dt: 'Roof/Wall/Window/Door', dd: 'Heat transfer through building envelope. Affected by insulation and glazing area.', keywords: ['roof','exterior wall','fenestration','opaque door','window','interzone wall','interzone ceiling','other roof'] },
        { dt: 'Infiltration', dd: 'Air leaking through cracks. Worse in less airtight buildings.', keywords: ['infiltration'] },
        { dt: 'Ventilation', dd: 'Required outdoor air. Often one of the largest loads.', keywords: ['zone ventilation','doas'] },
        { dt: 'Ground Contact', dd: 'Heat exchange through underground floors/walls.', keywords: ['ground contact'] }
      ]},
      { title: 'What the Numbers Mean', text: 'For example, a cooling peak of <b>50,000 Btu/h</b> (~14.7 kW) means you need about 4–5 tons of cooling capacity. A heating peak of <b>30,000 Btu/h</b> means ~8.8 kW boiler capacity.' }
    ]
  };

  var CATEGORY_LABELS_I18N = {
    heating:{ ko:'난방', en:'Heating' }, cooling:{ ko:'냉방', en:'Cooling' },
    interiorLighting:{ ko:'실내 조명', en:'Interior Lighting' },
    interiorEquipment:{ ko:'실내 장비', en:'Interior Equipment' },
    fans:{ ko:'송풍기', en:'Fans' }, pumps:{ ko:'펌프', en:'Pumps' },
    heatRecovery:{ ko:'열회수', en:'Heat Recovery' },
    exteriorLighting:{ ko:'외부 조명', en:'Exterior Lighting' },
    exteriorEquipment:{ ko:'외부 장비', en:'Exterior Equipment' },
    waterSystems:{ ko:'급수/급탕', en:'Water Systems' },
    refrigeration:{ ko:'냉장', en:'Refrigeration' },
    generators:{ ko:'발전기', en:'Generators' },
    humidification:{ ko:'가습', en:'Humidification' },
    heatRejection:{ ko:'열배출', en:'Heat Rejection' }
  };

  function t(key) { return (I18N[key] && I18N[key][lang]) || key; }
  function catLabel(key) { return (CATEGORY_LABELS_I18N[key] && CATEGORY_LABELS_I18N[key][lang]) || key; }

  // var MONTHS = RevitParser.MONTHS; // Not needed for K-HVAC design-day reports

  /* ===== SI conversion helpers ===== */
  function convVal(value, header) {
    if (unitMode === 'ip' || typeof value !== 'number') return value;
    var c = RevitParser.convertValueSI(value, header || '');
    return c.value;
  }
  function convHeader(header) {
    var h = header;
    if (lang === 'ko' && HEADER_KO[h]) h = HEADER_KO[h];
    if (unitMode === 'si') h = RevitParser.convertHeaderSI(h);
    return h;
  }
  function colDesc(header) {
    if (COL_DESC[header]) return COL_DESC[header][lang] || '';
    return '';
  }

  /* ===== DOM refs ===== */
  var $id = function(id) { return document.getElementById(id); };
  var uploadSection = $id('uploadSection');
  var uploadArea = $id('uploadArea');
  var fileInput = $id('fileInput');
  var reportCards = $id('reportCards');
  var cardsGrid = $id('cardsGrid');
  var tabNav = $id('tabNav');
  var toastEl = $id('toast');

  /* ===== Init ===== */
  function init() {
    uploadArea.addEventListener('click', function () { fileInput.click(); });
    uploadArea.addEventListener('dragover', function (e) { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', function () { uploadArea.classList.remove('dragover'); });
    uploadArea.addEventListener('drop', function (e) { e.preventDefault(); uploadArea.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', function () { handleFiles(fileInput.files); fileInput.value = ''; });
    $id('btnAddMore').addEventListener('click', function () { fileInput.click(); });
    $id('btnClearAll').addEventListener('click', clearAll);
    $id('btnTheme').addEventListener('click', toggleTheme);

    if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon();

    // Tabs
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () { switchTab(this.getAttribute('data-tab')); });
    }

    // Peak mode toggles
    $id('btnCooling').addEventListener('click', function () { peakMode = 'cooling'; updateToggle('peak'); renderPeakLoads(); });
    $id('btnHeating').addEventListener('click', function () { peakMode = 'heating'; updateToggle('peak'); renderPeakLoads(); });
    $id('btnCompareCooling').addEventListener('click', function () { comparePeakMode = 'cooling'; updateToggle('compare'); renderCompare(); });
    $id('btnCompareHeating').addEventListener('click', function () { comparePeakMode = 'heating'; updateToggle('compare'); renderCompare(); });

    // Unit toggles
    $id('btnIP').addEventListener('click', function () { unitMode = 'ip'; updateToggle('unit'); refreshAll(); });
    $id('btnSI').addEventListener('click', function () { unitMode = 'si'; updateToggle('unit'); refreshAll(); });

    // Language toggles
    $id('btnKO').addEventListener('click', function () { lang = 'ko'; updateToggle('lang'); applyLang(); if (reports.length > 0) refreshAll(); });
    $id('btnEN').addEventListener('click', function () { lang = 'en'; updateToggle('lang'); applyLang(); if (reports.length > 0) refreshAll(); });
    var savedLang = localStorage.getItem('lang');
    if (savedLang) { lang = savedLang; updateToggle('lang'); }
    applyLang();

    // Report selectors
    $id('selPeakReport').addEventListener('change', function () { populatePeakLevels(); renderPeakLoads(); });
    $id('selPeakLevel').addEventListener('change', function () { renderPeakLoads(); });
    $id('selZoneReport').addEventListener('change', function () { renderZones(); });
    $id('selEquipReport').addEventListener('change', function () { renderEquipment(); });
    $id('selVentReport').addEventListener('change', function () { renderVentilation(); });

    // Peak explain toggle
    $id('peakExplainToggle').addEventListener('click', function () {
      var body = $id('peakExplainBody');
      var arrow = $id('peakExplainArrow');
      if (body.style.display === 'none') { body.style.display = ''; arrow.classList.add('open'); }
      else { body.style.display = 'none'; arrow.classList.remove('open'); }
    });

    // Zone compare search + autocomplete
    $id('zoneSearchInput').addEventListener('input', function () {
      showAutoComplete(this.value);
    });
    $id('zoneSearchInput').addEventListener('focus', function () {
      if (this.value.trim()) showAutoComplete(this.value);
    });
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.zone-select-wrap')) hideAutoComplete();
      // Dismiss all highlights when clicking outside highlighted/clickable elements
      if (!e.target.closest('.row-highlight, .col-highlight, .explain-highlight, .comp-name-cell, .th-clickable, .info-clickable, .explain-clickable, .th-info')) {
        clearAllHighlights();
      }
    });
    $id('selZoneFilter').addEventListener('change', function () {
      highlightedZone = null;
      renderZoneCompareCards();
    });

    // Floating navigation
    var floatingNav = $id('floatingNav');
    var btnTop = $id('btnScrollTop');
    var btnToc = $id('btnTocToggle');
    var tocPanel = $id('tocPanel');
    if (floatingNav && btnTop) {
      floatingNav.style.display = '';
      window.addEventListener('scroll', function() {
        btnTop.style.display = window.scrollY > 300 ? '' : 'none';
      });
      btnTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      btnToc.addEventListener('click', function() {
        if (tocPanel.style.display === 'none') {
          buildToc();
          tocPanel.style.display = '';
          btnToc.classList.add('active');
        } else {
          tocPanel.style.display = 'none';
          btnToc.classList.remove('active');
        }
      });
      // Close TOC when clicking outside
      document.addEventListener('click', function(e) {
        if (tocPanel.style.display !== 'none' && !e.target.closest('.floating-nav')) {
          tocPanel.style.display = 'none';
          btnToc.classList.remove('active');
        }
      });
    }
  }

  /* ===== TOC Builder ===== */
  function buildToc() {
    var panel = $id('tocPanel');
    if (!panel) return;
    panel.innerHTML = '';

    // Find the currently visible tab section
    var activeTab = document.querySelector('.tab-content[style*="display: block"], .tab-content[style*="display:block"]');
    if (!activeTab) {
      // Try finding by active class or visible
      var tabs = document.querySelectorAll('.tab-content');
      for (var ti = 0; ti < tabs.length; ti++) {
        if (tabs[ti].style.display !== 'none' && tabs[ti].offsetHeight > 0) { activeTab = tabs[ti]; break; }
      }
    }
    if (!activeTab) return;

    // Collect section headings: h3, .section-group-title, .accordion-header
    var items = [];

    // Summary cards
    var summary = activeTab.querySelector('.summary-cards');
    if (summary && summary.children.length > 0) {
      items.push({ label: t('summaryCards') || (lang==='ko'?'요약 카드':'Summary'), el: summary });
    }

    // h3 headings
    var h3s = activeTab.querySelectorAll('h3, .section-group-title');
    for (var i = 0; i < h3s.length; i++) {
      var txt = h3s[i].textContent.trim();
      if (txt) items.push({ label: txt, el: h3s[i] });
    }

    // Accordion sections
    var accords = activeTab.querySelectorAll('.accordion-header');
    for (var a = 0; a < accords.length; a++) {
      var title = accords[a].querySelector('.accordion-title');
      if (title) items.push({ label: '  ' + title.textContent.trim(), el: accords[a], indent: true });
    }

    // Explain panel
    var explain = activeTab.querySelector('.explain-panel');
    if (explain) {
      var expTitle = explain.querySelector('.explain-toggle');
      items.push({ label: expTitle ? expTitle.textContent.trim() : (lang==='ko'?'수치 해설':'Explanation'), el: explain });
    }

    // Compare sections
    var compareSections = activeTab.querySelectorAll('[id$="Section"]');
    for (var cs = 0; cs < compareSections.length; cs++) {
      var csh3 = compareSections[cs].querySelector('h3');
      if (csh3 && compareSections[cs].style.display !== 'none') {
        items.push({ label: csh3.textContent.trim(), el: csh3 });
      }
    }

    if (items.length === 0) {
      panel.innerHTML = '<div style="padding:12px;font-size:12px;color:var(--text-muted);">' + (lang==='ko'?'목차 없음':'No sections') + '</div>';
      return;
    }

    for (var j = 0; j < items.length; j++) {
      var btn = document.createElement('button');
      btn.className = 'toc-item' + (items[j].indent ? ' toc-indent' : '');
      btn.textContent = items[j].label;
      btn.setAttribute('data-toc-idx', j);
      (function(el) {
        btn.addEventListener('click', function() {
          var rect = el.getBoundingClientRect();
          var scrollTop = window.pageYOffset + rect.top - 20;
          window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
          // Close panel
          $id('tocPanel').style.display = 'none';
          $id('btnTocToggle').classList.remove('active');
        });
      })(items[j].el);
      panel.appendChild(btn);
    }
  }

  /* ===== File handling ===== */
  function handleFiles(files) {
    var pending = [];
    for (var i = 0; i < files.length; i++) {
      if (/\.html?$/i.test(files[i].name)) pending.push(files[i]);
    }
    if (pending.length === 0) { toast(t('uploadHtmlOnly'), 'error'); return; }
    var done = 0;
    for (var j = 0; j < pending.length; j++) {
      (function (f) {
        var reader = new FileReader();
        reader.onload = function (e) {
          try {
            var report = RevitParser.parse(e.target.result, f.name);
            reports.push(report);
            toast(t('loaded') + report.fileName, 'success');
          } catch (err) {
            toast(t('parseError') + err.message, 'error');
          }
          done++;
          if (done === pending.length) afterLoad();
        };
        reader.readAsText(f);
      })(pending[j]);
    }
  }

  function afterLoad() {
    showUI();
    renderCards();
    populateSelectors();
    populatePeakLevels();
    refreshAll();
  }

  function refreshAll() {
    renderPeakLoads();
    renderZones();
    renderEquipment();
    renderVentilation();
    renderCompare();
    renderZoneCompare();
  }

  function clearAll() {
    reports = [];
    destroyAllCharts();
    cardsGrid.innerHTML = '';
    reportCards.style.display = 'none';
    tabNav.style.display = 'none';
    hideAllTabs();
    uploadSection.style.display = '';
  }

  function destroyAllCharts() {
    for (var k in charts) { if (charts[k]) { charts[k].destroy(); delete charts[k]; } }
  }

  /* ===== UI ===== */
  function showUI() {
    uploadSection.style.display = 'none';
    reportCards.style.display = '';
    tabNav.style.display = '';
    switchTab('peakloads');
  }

  function switchTab(tab) {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab') === tab);
    var contents = document.querySelectorAll('.tab-content');
    for (var j = 0; j < contents.length; j++) {
      var id = contents[j].id.replace('tab-', '');
      contents[j].style.display = (id === tab) ? '' : 'none';
      contents[j].classList.toggle('active', id === tab);
    }
  }

  function hideAllTabs() {
    var contents = document.querySelectorAll('.tab-content');
    for (var i = 0; i < contents.length; i++) contents[i].style.display = 'none';
  }

  function updateToggle(type) {
    if (type === 'peak') {
      $id('btnCooling').classList.toggle('active', peakMode === 'cooling');
      $id('btnHeating').classList.toggle('active', peakMode === 'heating');
    } else if (type === 'compare') {
      $id('btnCompareCooling').classList.toggle('active', comparePeakMode === 'cooling');
      $id('btnCompareHeating').classList.toggle('active', comparePeakMode === 'heating');
    } else if (type === 'unit') {
      $id('btnIP').classList.toggle('active', unitMode === 'ip');
      $id('btnSI').classList.toggle('active', unitMode === 'si');
    } else if (type === 'lang') {
      $id('btnKO').classList.toggle('active', lang === 'ko');
      $id('btnEN').classList.toggle('active', lang === 'en');
      localStorage.setItem('lang', lang);
    }
  }

  function applyLang() {
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      if (I18N[key]) els[i].textContent = I18N[key][lang] || els[i].textContent;
    }
    // Placeholders
    var phEls = document.querySelectorAll('[data-i18n-placeholder]');
    for (var p = 0; p < phEls.length; p++) {
      var pk = phEls[p].getAttribute('data-i18n-placeholder');
      if (I18N[pk]) phEls[p].placeholder = I18N[pk][lang] || '';
    }
    document.documentElement.setAttribute('lang', lang === 'ko' ? 'ko' : 'en');
    // Update peak explain
    renderPeakExplain();
  }

  function renderCards() {
    cardsGrid.innerHTML = '';
    $id('reportCount').textContent = reports.length;
    for (var i = 0; i < reports.length; i++) {
      var r = reports[i];
      var color = REPORT_COLORS[i % REPORT_COLORS.length];
      var tags = [];
      if (r.peakLoads.cooling.length > 0 || r.peakLoads.heating.length > 0) tags.push('Peak Loads');
      if (r.zones.length > 0) tags.push('Zones (' + r.zones.length + ')');
      if (Object.keys(r.equipment).length > 0) tags.push(lang==='ko'?'장비':'Equipment');
      if (Object.keys(r.hvacSizing).length > 0) tags.push(lang==='ko'?'사이징':'Sizing');
      if (Object.keys(r.outdoorAir).length > 0) tags.push(lang==='ko'?'환기':'Ventilation');
      if (Object.keys(r.envelope).length > 0) tags.push(lang==='ko'?'외피':'Envelope');
      if (r.spaces.length > 0) tags.push('Spaces');

      var card = document.createElement('div');
      card.className = 'report-card';
      card.innerHTML =
        '<div class="card-color" style="background:' + color + '"></div>' +
        '<div class="card-body">' +
          '<div class="card-title">' + escHtml(r.fileName) + '</div>' +
          '<div class="card-meta">' +
            (r.timestamp ? '<span>' + t('timestamp') + ': ' + escHtml(r.timestamp) + '</span>' : '') +
            (r.reportType ? '<span>' + t('type') + ': ' + escHtml(r.reportType) + '</span>' : '') +
            (r.facility ? '<span>' + t('forFacility') + ': ' + escHtml(r.facility) + '</span>' : '') +
            '<span>' + t('data') + ': ' + (tags.length > 0 ? tags.join(', ') : '...') + '</span>' +
            (r.isDesignDay ? '<span style="color:#f59e0b" title="' + escAttr(t('designDayNote')) + '">&#9888; ' + (lang==='ko'?'설계일':'Design Day') + '</span>' : '') +
            (r.warnings.length > 0 ? '<span style="color:var(--warning)">' + t('warnings') + ': ' + r.warnings.length + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="card-actions"><button class="btn-close" data-idx="' + i + '" title="Remove">&times;</button></div>';
      card.querySelector('.btn-close').addEventListener('click', (function (idx) {
        return function () { reports.splice(idx, 1); if (reports.length === 0) clearAll(); else afterLoad(); };
      })(i));
      cardsGrid.appendChild(card);
    }
  }

  function populateSelectors() {
    var selectors = ['selPeakReport', 'selZoneReport', 'selEquipReport', 'selVentReport'];
    for (var s = 0; s < selectors.length; s++) {
      var sel = $id(selectors[s]);
      var prev = sel.value;
      sel.innerHTML = '';
      for (var i = 0; i < reports.length; i++) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.textContent = reports[i].fileName;
        sel.appendChild(opt);
      }
      if (prev && parseInt(prev) < reports.length) sel.value = prev;
    }
  }

  function rowName(obj) {
    return obj._name || obj.component || obj.Name || obj[''] || '';
  }

  /* ===== Peak Level Selector ===== */
  function populatePeakLevels() {
    var idx = parseInt($id('selPeakReport').value) || 0;
    if (!reports[idx]) return;
    var r = reports[idx];
    var sel = $id('selPeakLevel');
    var prev = sel.value;
    sel.innerHTML = '';

    var optF = document.createElement('option');
    optF.value = 'facility'; optF.textContent = t('facility');
    sel.appendChild(optF);

    if (r.airloopPeakLoads && (r.airloopPeakLoads.cooling.length > 0 || r.airloopPeakLoads.heating.length > 0)) {
      var optA = document.createElement('option');
      optA.value = 'airloop'; optA.textContent = t('airloop');
      sel.appendChild(optA);
    }

    if (r.zonePeakLoads) {
      var zoneNames = Object.keys(r.zonePeakLoads);
      for (var i = 0; i < zoneNames.length; i++) {
        var optZ = document.createElement('option');
        optZ.value = 'zone:' + zoneNames[i];
        optZ.textContent = 'Zone: ' + zoneNames[i];
        sel.appendChild(optZ);
      }
    }

    if (prev) {
      for (var j = 0; j < sel.options.length; j++) {
        if (sel.options[j].value === prev) { sel.value = prev; break; }
      }
    }
  }

  function getPeakData(report, mode) {
    var level = $id('selPeakLevel').value || 'facility';
    if (level === 'facility') return mode === 'cooling' ? report.peakLoads.cooling : report.peakLoads.heating;
    if (level === 'airloop') return mode === 'cooling' ? report.airloopPeakLoads.cooling : report.airloopPeakLoads.heating;
    if (level.indexOf('zone:') === 0) {
      var zp = report.zonePeakLoads[level.substring(5)];
      if (zp) return mode === 'cooling' ? zp.cooling : zp.heating;
    }
    return [];
  }

  /* ===== PEAK LOADS TAB ===== */
  function renderPeakLoads() {
    var idx = parseInt($id('selPeakReport').value) || 0;
    if (!reports[idx]) return;
    var data = getPeakData(reports[idx], peakMode);
    var label = peakMode === 'cooling' ? t('cooling') : t('heating');
    $id('peakChartTitle').textContent = peakMode === 'cooling' ? t('peakChartCooling') : t('peakChartHeating');
    $id('peakTableTitle').textContent = peakMode === 'cooling' ? t('peakTableCooling') : t('peakTableHeating');
    renderPeakSummary(data, label);
    renderPeakChart(data, label);
    renderPeakTable(data);
    renderPeakExplain();
  }

  function renderPeakSummary(data, label) {
    var container = $id('peakSummary');
    if (!data || data.length === 0) { container.innerHTML = '<div class="summary-card"><div class="label">' + t('noPeakData') + '</div></div>'; return; }
    var gt = data.find(function (r) { return /grand\s*total/i.test(rowName(r)); });
    var filtered = data.filter(function(r){ return !/grand\s*total/i.test(rowName(r)) && (r['Total [Btu/h]']||0) !== 0; });
    var maxRow = filtered.length > 0
      ? filtered.reduce(function(a,b){ return Math.abs(b['Total [Btu/h]']||0) > Math.abs(a['Total [Btu/h]']||0) ? b : a; })
      : {_name:'-','Total [Btu/h]':0};
    var totalUnit = unitMode === 'si' ? 'W' : 'Btu/h';
    var gtTotal = gt ? Math.abs(convVal(gt['Total [Btu/h]'] || 0, 'Btu/h')) : 0;
    var gtInstant = gt ? Math.abs(convVal(gt['Sensible - Instant [Btu/h]'] || 0, 'Btu/h')) : 0;
    var gtDelayed = gt ? Math.abs(convVal(gt['Sensible - Delayed [Btu/h]'] || 0, 'Btu/h')) : 0;
    var gtLatent = gt ? Math.abs(convVal(gt['Latent [Btu/h]'] || 0, 'Btu/h')) : 0;
    var cards = [
      { label: t('grandTotal'), value: fmtNum(gtTotal), unit: totalUnit, cls: 'highlight' },
      { label: t('sensInstant'), value: fmtNum(gtInstant), unit: totalUnit },
      { label: t('sensDelayed'), value: fmtNum(gtDelayed), unit: totalUnit },
      { label: t('latent'), value: fmtNum(gtLatent), unit: totalUnit },
      { label: t('dominantComp'), value: rowName(maxRow), unit: '', cls: 'warn', isText: true },
      { label: t('dominantPct'), value: fmtNum(maxRow['%Grand Total'] || 0), unit: '%', cls: 'warn' }
    ];
    var html = '';
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      html += '<div class="summary-card ' + (c.cls||'') + '"><div class="label">' + c.label + '</div>';
      if (c.isText) html += '<div class="value" style="font-size:15px">' + escHtml(String(c.value)) + '</div>';
      else html += '<div class="value">' + c.value + '<span class="unit">' + c.unit + '</span></div>';
      html += '</div>';
    }
    container.innerHTML = html;
  }

  function renderPeakChart(data, label) {
    if (charts.peakLoad) { charts.peakLoad.destroy(); delete charts.peakLoad; }
    if (!data || data.length === 0) return;
    var items = data.filter(function (r) { return !/grand\s*total/i.test(rowName(r)) && (r['Total [Btu/h]'] || 0) !== 0; });
    items.sort(function (a, b) { return Math.abs(b['Total [Btu/h]']||0) - Math.abs(a['Total [Btu/h]']||0); });
    var labels = items.map(function (r) { return rowName(r); });
    var totals = items.map(function (r) { return Math.abs(convVal(r['Total [Btu/h]']||0, 'Btu/h')); });
    var barColor = peakMode === 'cooling' ? 'rgba(59,130,246,0.75)' : 'rgba(239,68,68,0.75)';
    charts.peakLoad = new Chart($id('chartPeakLoad'), {
      type: 'bar',
      data: { labels: labels, datasets: [{ label: convHeader('Total [Btu/h]'), data: totals, backgroundColor: barColor, borderRadius: 4 }] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        scales: { x: { beginAtZero: true, ticks: { callback: function (v) { return fmtNum(v); } } } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return fmtNum(ctx.raw) + ' ' + (unitMode==='si'?'W':'Btu/h'); } } } },
        onClick: function(evt, elements) {
          if (elements.length > 0) {
            var idx2 = elements[0].index;
            var compName = labels[idx2];
            highlightTableRow('tablePeakLoad', compName.toLowerCase());
          }
        }
      }
    });
  }

  function renderPeakTable(data) {
    var table = $id('tablePeakLoad');
    if (!data || data.length === 0) { table.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;">' + t('noData') + '</td></tr>'; return; }
    var colSet = {};
    data.forEach(function(row) { for (var k in row) { if (k === '_name' || k === 'component' || k === '' || k === 'Name') continue; if (typeof row[k] === 'number') colSet[k] = true; } });
    var cols = Object.keys(colSet);
    var activeCols = cols.filter(function(col) { return data.some(function(r){ return (r[col]||0) !== 0; }); });
    var colMax = {};
    activeCols.forEach(function(col) {
      var vals = data.filter(function(r){ return !/grand\s*total/i.test(rowName(r)); }).map(function(r){ return Math.abs(r[col]||0); });
      colMax[col] = Math.max.apply(null, vals.concat([1]));
    });
    var html = '<thead><tr><th style="text-align:left">' + t('component') + '</th>';
    for (var h = 0; h < activeCols.length; h++) {
      var tooltip = colDesc(activeCols[h]);
      var tipAttr = tooltip ? ' title="' + escAttr(tooltip) + '"' : '';
      html += '<th>' + escHtml(convHeader(activeCols[h])) + (tooltip ? ' <span class="th-info"' + tipAttr + '>&#10067;</span>' : '') + '</th>';
    }
    html += '</tr></thead><tbody>';
    for (var r = 0; r < data.length; r++) {
      var row = data[r]; var name = rowName(row);
      var isGT = /grand\s*total/i.test(name);
      html += '<tr data-comp="' + escAttr(name.toLowerCase()) + '"' + (isGT ? ' style="font-weight:700;background:rgba(59,130,246,0.05)"' : '') + '>';
      html += '<td style="text-align:left" class="comp-name-cell">' + escHtml(name) + '</td>';
      for (var c = 0; c < activeCols.length; c++) {
        var v = row[activeCols[c]] || 0;
        var displayV = convVal(v, activeCols[c]);
        var cls = isGT ? '' : getPeakCellClass(v, colMax[activeCols[c]], activeCols[c]);
        var barW = colMax[activeCols[c]] > 0 ? Math.round((Math.abs(v) / colMax[activeCols[c]]) * 100) : 0;
        var barCls = v < 0 ? 'cell-bar cell-bar-cool' : 'cell-bar cell-bar-heat';
        var barHtml = Math.abs(v) > 0 && !isGT ? '<br><span class="' + barCls + '" style="width:' + barW + '%"></span>' : '';
        html += '<td class="' + cls + '">' + fmtTable(displayV) + barHtml + '</td>';
      }
      html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;

    // Bind click on component names → scroll to explanation
    var nameCells = table.querySelectorAll('.comp-name-cell');
    for (var nc = 0; nc < nameCells.length; nc++) {
      nameCells[nc].addEventListener('click', function() {
        scrollToExplanation(this.textContent.trim().toLowerCase());
      });
    }

    // Bind Grand Total row click → scroll to peak chart and highlight all bars
    var gtRow = table.querySelector('tr[data-comp="grand total"]');
    if (gtRow) {
      gtRow.addEventListener('click', function() {
        scrollToChartAndHighlightAll('peakLoad');
      });
    }
  }

  function scrollToExplanation(compName) {
    clearAllHighlights();
    var body = $id('peakExplainBody');
    var arrow = $id('peakExplainArrow');
    if (body && body.style.display === 'none') {
      body.style.display = '';
      if (arrow) arrow.classList.add('open');
    }
    var container = $id('peakExplainContent');
    if (!container) return;
    var items = container.querySelectorAll('.explain-clickable');
    var target = null;
    for (var i = 0; i < items.length; i++) {
      var keywords = items[i].getAttribute('data-keywords').split(',');
      for (var k = 0; k < keywords.length; k++) {
        if (compName.indexOf(keywords[k]) !== -1) { target = items[i]; break; }
      }
      if (target) break;
    }
    if (target) {
      target.classList.add('explain-highlight');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function renderPeakExplain() {
    var container = $id('peakExplainContent');
    if (!container) return;
    var items = PEAK_EXPLAIN[lang] || PEAK_EXPLAIN.ko;
    var html = '';
    for (var i = 0; i < items.length; i++) {
      html += '<h5>' + items[i].title + '</h5>';
      if (items[i].text) html += '<p>' + items[i].text + '</p>';
      if (items[i].items) {
        for (var j = 0; j < items[i].items.length; j++) {
          var item = items[i].items[j];
          var kw = item.keywords ? item.keywords.join(',') : '';
          if (kw) {
            html += '<div class="explain-item explain-clickable" data-keywords="' + escAttr(kw) + '">';
            html += '<dt>' + item.dt + ' <span class="explain-goto">&#8594; ' + (lang==='ko'?'테이블에서 보기':'View in table') + '</span></dt>';
            html += '<dd>' + item.dd + '</dd></div>';
          } else {
            html += '<div class="explain-item"><dt>' + item.dt + '</dt><dd>' + item.dd + '</dd></div>';
          }
        }
      }
    }
    container.innerHTML = html;

    // Bind click events for clickable items
    var clickables = container.querySelectorAll('.explain-clickable');
    for (var k = 0; k < clickables.length; k++) {
      clickables[k].addEventListener('click', function() {
        var keywords = this.getAttribute('data-keywords').split(',');
        highlightTableRowsByKeywords('tablePeakLoad', keywords);
      });
    }
  }

  /* ===== Generic highlight helpers ===== */
  function clearAllHighlights() {
    var hl = document.querySelectorAll('.row-highlight, .explain-highlight, .col-highlight');
    for (var i = 0; i < hl.length; i++) hl[i].classList.remove('row-highlight', 'explain-highlight', 'col-highlight');
  }

  /** Scroll to a chart and flash-highlight a specific bar by label name */
  function scrollToChartBar(chartKey, labelName) {
    clearAllHighlights();
    var chart = charts[chartKey];
    if (!chart) return;
    var canvas = chart.canvas;
    if (canvas) {
      var card = canvas.closest('.chart-card') || canvas.parentElement;
      var h3 = card.querySelector('h3');
      var target = h3 || card;
      var rect = target.getBoundingClientRect();
      var scrollTop = window.pageYOffset + rect.top - 20;
      window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
    }
    // Find the data index matching the label
    var labels = chart.data.labels || [];
    var idx = -1;
    for (var i = 0; i < labels.length; i++) {
      if (labels[i] === labelName) { idx = i; break; }
    }
    if (idx < 0) return;
    // Highlight all datasets for this index
    var activeEls = [];
    var tooltipEls = [];
    for (var di = 0; di < chart.data.datasets.length; di++) {
      activeEls.push({ datasetIndex: di, index: idx });
      tooltipEls.push({ datasetIndex: di, index: idx });
    }
    chart.setActiveElements(activeEls);
    chart.tooltip.setActiveElements(tooltipEls, { x: 0, y: 0 });
    chart.update();
    // Clear after 3 seconds
    setTimeout(function() {
      if (charts[chartKey]) {
        charts[chartKey].setActiveElements([]);
        charts[chartKey].tooltip.setActiveElements([], { x: 0, y: 0 });
        charts[chartKey].update();
      }
    }, 3000);
  }

  /** Scroll to chart and highlight ALL bars (for Grand Total click) */
  function scrollToChartAndHighlightAll(chartKey) {
    clearAllHighlights();
    var chart = charts[chartKey];
    if (!chart) return;
    var canvas = chart.canvas;
    if (canvas) {
      // Find the chart card, then look for its h3 title inside
      var card = canvas.closest('.chart-card') || canvas.parentElement;
      var h3 = card.querySelector('h3');
      var target = h3 || card;
      var rect = target.getBoundingClientRect();
      var scrollTop = window.pageYOffset + rect.top - 20;
      window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
    }
    var labels = chart.data.labels || [];
    if (labels.length === 0) return;
    var activeEls = [];
    var tooltipEls = [];
    for (var i = 0; i < labels.length; i++) {
      for (var di = 0; di < chart.data.datasets.length; di++) {
        activeEls.push({ datasetIndex: di, index: i });
      }
    }
    chart.setActiveElements(activeEls);
    chart.update();
    setTimeout(function() {
      if (charts[chartKey]) {
        charts[chartKey].setActiveElements([]);
        charts[chartKey].update();
      }
    }, 3000);
  }

  /** Scroll so that the table section title (h3) and header row are visible */
  function scrollToTableTitle(tableEl) {
    var section = tableEl.closest('.table-section');
    var target = section || tableEl.closest('.table-scroll') || tableEl;
    if (section) {
      var h3 = section.querySelector('h3');
      if (h3) target = h3;
    }
    var rect = target.getBoundingClientRect();
    var offset = window.pageYOffset + rect.top - 20; // 20px top padding
    window.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
  }

  /** Scroll so that a specific table's title+header+first rows are visible */
  function scrollToTableWithRow(tableId, rowEl) {
    var table = $id(tableId);
    if (!table) { if (rowEl) rowEl.scrollIntoView({ behavior:'smooth', block:'center' }); return; }
    var section = table.closest('.table-section');
    if (section) {
      var h3 = section.querySelector('h3');
      var target = h3 || section;
      var rect = target.getBoundingClientRect();
      var scrollTop = window.pageYOffset + rect.top - 20;
      window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
      // After scroll completes, check if the highlighted row is visible, if not scroll further
      if (rowEl) {
        setTimeout(function() {
          var rowRect = rowEl.getBoundingClientRect();
          if (rowRect.bottom > window.innerHeight || rowRect.top < 0) {
            rowEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 500);
      }
    } else if (rowEl) {
      rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function highlightTableRow(tableId, compNameLower) {
    clearAllHighlights();
    var table = $id(tableId);
    if (!table) return;
    var rows = table.querySelectorAll('tbody tr[data-comp]');
    var firstMatch = null;
    for (var i = 0; i < rows.length; i++) {
      var comp = rows[i].getAttribute('data-comp');
      if (comp === compNameLower || comp.indexOf(compNameLower) !== -1) {
        rows[i].classList.add('row-highlight');
        if (!firstMatch) firstMatch = rows[i];
      }
    }
    if (firstMatch) scrollToTableWithRow(tableId, firstMatch);
  }

  function highlightTableRowsByKeywords(tableId, keywords) {
    clearAllHighlights();
    var table = $id(tableId);
    if (!table) return;
    var rows = table.querySelectorAll('tbody tr[data-comp]');
    var firstMatch = null;
    for (var i = 0; i < rows.length; i++) {
      var comp = rows[i].getAttribute('data-comp');
      for (var k = 0; k < keywords.length; k++) {
        if (comp.indexOf(keywords[k]) !== -1) {
          rows[i].classList.add('row-highlight');
          if (!firstMatch) firstMatch = rows[i];
          break;
        }
      }
    }
    if (firstMatch) scrollToTableWithRow(tableId, firstMatch);
  }

  function highlightTableCol(tableId, colHeader) {
    clearAllHighlights();
    var table = $id(tableId);
    if (!table) return;
    var ths = table.querySelectorAll('thead th');
    var colIdx = -1;
    for (var i = 0; i < ths.length; i++) {
      if (ths[i].textContent.indexOf(colHeader) !== -1) { colIdx = i; break; }
    }
    if (colIdx < 0) return;
    ths[colIdx].classList.add('col-highlight');
    var rows = table.querySelectorAll('tbody tr');
    for (var r = 0; r < rows.length; r++) {
      var cells = rows[r].querySelectorAll('td');
      if (cells[colIdx]) cells[colIdx].classList.add('col-highlight');
    }
    scrollToTableTitle(table);
  }

  function getPeakCellClass(value, max, colName) {
    if (value === 0) return 'cell-zero';
    if (/%grand/i.test(colName)) {
      var pct = Math.abs(value);
      if (pct >= 15) return 'cell-high';
      if (pct >= 5) return 'cell-mid';
      return 'cell-low';
    }
    var ratio = max > 0 ? Math.abs(value) / max : 0;
    if (ratio >= 0.7) return 'cell-high';
    if (ratio >= 0.2) return 'cell-mid';
    return 'cell-low';
  }

  /* ===== ZONES TAB ===== */
  function renderZones() {
    var idx = parseInt($id('selZoneReport').value) || 0;
    if (!reports[idx]) return;
    renderZoneChart(reports[idx].zones);
    renderDataTable('tableZoneSummary', reports[idx].zones, { chartId: 'zones' });
    renderDataTable('tableSpaceSummary', reports[idx].spaces);
  }

  function renderZoneChart(zones) {
    if (charts.zones) { charts.zones.destroy(); delete charts.zones; }
    var items = zones.filter(function (z) { return !/total|conditioned|unconditioned|not part/i.test(rowName(z)); });
    if (items.length === 0) return;
    var volKey = 'Volume [ft3]', wallKey = 'Above Ground Gross Wall Area [ft2]', winKey = 'Window Glass Area [ft2]';
    var zoneLabels = items.map(function (z) { return rowName(z); });
    charts.zones = new Chart($id('chartZones'), {
      type: 'bar',
      data: {
        labels: zoneLabels,
        datasets: [
          { label: convHeader(volKey), data: items.map(function(z){ return convVal(z[volKey]||0, volKey); }), backgroundColor: 'rgba(59,130,246,0.7)', yAxisID: 'y', borderRadius: 3 },
          { label: convHeader(wallKey), data: items.map(function(z){ return convVal(z[wallKey]||0, wallKey); }), backgroundColor: 'rgba(239,68,68,0.7)', yAxisID: 'y1', borderRadius: 3 },
          { label: convHeader(winKey), data: items.map(function(z){ return convVal(z[winKey]||0, winKey); }), backgroundColor: 'rgba(234,179,8,0.7)', yAxisID: 'y1', borderRadius: 3 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          y: { type:'linear', position:'left', title:{ display:true, text: convHeader('Volume [ft3]') }, beginAtZero:true },
          y1: { type:'linear', position:'right', title:{ display:true, text: convHeader('Area [ft2]') }, beginAtZero:true, grid:{drawOnChartArea:false} }
        },
        plugins: { tooltip: { callbacks: { label: function(ctx){ return ctx.dataset.label + ': ' + fmtNum(ctx.raw); } } } },
        onClick: function(evt, elements) {
          if (elements.length > 0) {
            var idx2 = elements[0].index;
            var zoneName = zoneLabels[idx2];
            highlightTableRow('tableZoneSummary', zoneName.toLowerCase());
          }
        }
      }
    });
  }

  /* ===== Generic Data Table ===== */
  function renderDataTable(tableId, data, options) {
    options = options || {};
    var table = $id(tableId);
    var wrapper = table ? (table.closest('.table-scroll') || table.parentElement) : document.querySelector('[data-table-wrap="' + tableId + '"]');
    if (!table && !wrapper) return;

    if (!data || data.length === 0) {
      var emptyHtml = '<div data-table-wrap="' + tableId + '"><table class="data-table" id="' + tableId + '"><tr><td style="text-align:center;padding:40px;">' + t('noData') + '</td></tr></table></div>';
      if (wrapper) wrapper.outerHTML = emptyHtml; else if (table) table.outerHTML = emptyHtml;
      return;
    }

    var allZero = data.every(function(row) { for (var k in row) { if (k !== '_name' && typeof row[k] === 'number' && row[k] !== 0) return false; } return true; });
    var keys = [], keySet = {};
    for (var i = 0; i < data.length; i++) { for (var k in data[i]) { if (k === '_name') continue; if (!keySet[k]) { keySet[k] = true; keys.push(k); } } }
    var colMax = {}, colSum = {};
    keys.forEach(function (k) {
      var vals = data.filter(function(r){ return !/total|conditioned|unconditioned|not part/i.test(rowName(r)); }).map(function(r) { return typeof r[k] === 'number' ? Math.abs(r[k]) : 0; });
      colMax[k] = Math.max.apply(null, vals.concat([0]));
      colSum[k] = vals.reduce(function(a,b){return a+b;}, 0);
    });

    // Info panel
    var infoHtml = '', hasDesc = false;
    for (var di = 0; di < keys.length; di++) {
      var desc = colDesc(keys[di]);
      if (desc) {
        hasDesc = true;
        var colKey = keys[di];
        var displayH = colKey === '' ? t('name') : convHeader(colKey);
        infoHtml += '<div class="info-row info-clickable" data-col-key="' + escAttr(colKey) + '" data-table="' + escAttr(tableId) + '">'
          + '<dt>' + escHtml(displayH) + ' <span class="explain-goto">\u2192 ' + t('goToTable') + '</span>:</dt> <dd>' + escHtml(desc) + '</dd></div>';
      }
    }

    var html = '';
    if (hasDesc && !options.noInfo) {
      var panelId = tableId + '_info';
      html += '<div class="col-info-toggle" onclick="var p=document.getElementById(\'' + panelId + '\');p.classList.toggle(\'show\');this.querySelector(\'span\').textContent=p.classList.contains(\'show\')?\'' + t('hideColInfo') + '\':\'' + t('showColInfo') + '\'"><span>' + t('showColInfo') + '</span> &#10067;</div>';
      html += '<div class="col-info-panel" id="' + panelId + '">' + infoHtml + '</div>';
    }
    html += '<table class="data-table" id="' + tableId + '">';
    if (allZero && !options.noZeroWarn) html += '<caption style="caption-side:top;text-align:left;font-size:12px;color:var(--warning);padding:6px 0;">' + t('designDayNote') + '</caption>';
    html += '<thead><tr>';
    for (var h = 0; h < keys.length; h++) {
      var displayHeader = keys[h] === '' ? t('name') : convHeader(keys[h]);
      var tooltip = colDesc(keys[h]);
      var tipAttr = tooltip ? ' title="' + escAttr(tooltip) + '"' : '';
      var infoIcon = tooltip ? ' <span class="th-info"' + tipAttr + '>&#10067;</span>' : '';
      var thCls = (tooltip && hasDesc) ? ' class="th-clickable" data-col-key="' + escAttr(keys[h]) + '" data-info-panel="' + escAttr(tableId + '_info') + '"' : '';
      html += '<th' + (h === 0 ? ' style="text-align:left"' : '') + thCls + '>' + escHtml(displayHeader) + infoIcon + '</th>';
    }
    html += '</tr></thead><tbody>';
    for (var r = 0; r < data.length; r++) {
      var row = data[r];
      var rn = rowName(row);
      var isSummary = /total|conditioned|unconditioned|not part/i.test(rn);
      var compAttr = rn ? ' data-comp="' + escAttr(rn.toLowerCase()) + '"' : '';
      html += '<tr' + compAttr + (isSummary ? ' style="font-weight:700;background:rgba(59,130,246,0.03)"' : '') + '>';
      for (var c = 0; c < keys.length; c++) {
        var v = row[keys[c]];
        if (c === 0) {
          var nameCls = (options.chartId && !isSummary) ? ' class="comp-name-cell" data-chart-id="' + escAttr(options.chartId) + '"' : '';
          html += '<td style="text-align:left"' + nameCls + '>' + escHtml(String(v || rn || '')) + '</td>';
        } else if (typeof v === 'number') {
          var displayV = convVal(v, keys[c]);
          var cls = isSummary ? '' : getGenericCellClass(v, colMax[keys[c]], colSum[keys[c]]);
          html += '<td class="' + cls + '">' + fmtTable(displayV) + '</td>';
        } else html += '<td>' + escHtml(String(v !== undefined ? v : '')) + '</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    // Table highlight legend
    if (!allZero && !options.noLegend) {
      html += '<div class="table-legend">'
        + '<span class="legend-item"><span class="dot dot-high"></span> ' + t('tblLegendHigh') + '</span>'
        + '<span class="legend-item"><span class="dot dot-mid"></span> ' + t('tblLegendMid') + '</span>'
        + '<span class="legend-item"><span class="dot dot-low"></span> ' + t('tblLegendLow') + '</span>'
        + '<span class="legend-item"><span class="dot dot-zero"></span> ' + t('tblLegendZero') + '</span>'
        + '</div>';
    }
    var wrapHtml = '<div class="table-scroll" data-table-wrap="' + tableId + '">' + html + '</div>';
    if (wrapper) wrapper.outerHTML = wrapHtml; else if (table) table.outerHTML = wrapHtml;

    // Bind info-panel item click → highlight column in table
    var newPanel = $id(panelId);
    if (newPanel) {
      var infoItems = newPanel.querySelectorAll('.info-clickable');
      for (var ic = 0; ic < infoItems.length; ic++) {
        infoItems[ic].addEventListener('click', function() {
          var colKey = this.getAttribute('data-col-key');
          var tblId = this.getAttribute('data-table');
          var tbl = $id(tblId);
          if (!tbl) return;
          clearAllHighlights();
          var ths = tbl.querySelectorAll('thead th');
          var colIdx = -1;
          for (var ci = 0; ci < ths.length; ci++) {
            var thKey = ths[ci].getAttribute('data-col-key');
            if (thKey === colKey) { colIdx = ci; break; }
          }
          if (colIdx < 0) return;
          ths[colIdx].classList.add('col-highlight');
          var trs = tbl.querySelectorAll('tbody tr');
          for (var ri = 0; ri < trs.length; ri++) {
            var tds = trs[ri].querySelectorAll('td');
            if (tds[colIdx]) tds[colIdx].classList.add('col-highlight');
          }
          // Scroll to the table section title (h3) above the table so header stays visible
          scrollToTableTitle(tbl);
        });
      }
    }

    // Bind th click → scroll to info panel item
    var newTable = $id(tableId);
    if (newTable) {
      var clickThs = newTable.querySelectorAll('.th-clickable');
      for (var ti = 0; ti < clickThs.length; ti++) {
        clickThs[ti].addEventListener('click', function() {
          var colKey = this.getAttribute('data-col-key');
          var panId = this.getAttribute('data-info-panel');
          var pan = $id(panId);
          if (!pan) return;
          clearAllHighlights();
          // Open panel if closed
          if (!pan.classList.contains('show')) {
            pan.classList.add('show');
            var toggle = pan.previousElementSibling;
            if (toggle && toggle.querySelector('span')) toggle.querySelector('span').textContent = t('hideColInfo');
          }
          var rows2 = pan.querySelectorAll('.info-clickable');
          for (var ri = 0; ri < rows2.length; ri++) {
            if (rows2[ri].getAttribute('data-col-key') === colKey) {
              rows2[ri].classList.add('explain-highlight');
              rows2[ri].scrollIntoView({ behavior: 'smooth', block: 'center' });
              break;
            }
          }
        });
      }
    }

    // Bind name cell click → scroll to chart and highlight bar
    if (newTable && options.chartId) {
      var nameCells = newTable.querySelectorAll('.comp-name-cell[data-chart-id]');
      for (var ni = 0; ni < nameCells.length; ni++) {
        nameCells[ni].addEventListener('click', function() {
          var chartKey = this.getAttribute('data-chart-id');
          var name = this.textContent.trim();
          scrollToChartBar(chartKey, name);
        });
      }
    }
  }

  function getGenericCellClass(value, max, total) {
    if (value === 0) return 'cell-zero';
    var absV = Math.abs(value);
    if (max > 0 && absV === max) return 'cell-high';
    if (total > 0 && absV / total > 0.15) return 'cell-mid';
    return 'cell-low';
  }

  /* ===== ACCORDION HELPERS ===== */
  var SECTION_DESC = {
    eqCoolingCoils: { ko:'냉방에 사용되는 코일입니다. 용량이 클수록 더 많은 냉방이 가능합니다.', en:'Cooling coil equipment. Check rated capacity and efficiency.' },
    eqHeatingCoils: { ko:'난방에 사용되는 코일입니다. 용량이 클수록 더 많은 난방이 가능합니다.', en:'Heating coil equipment. Check rated capacity and efficiency.' },
    eqFans:         { ko:'공기를 보내주는 송풍기입니다. 풍량이 크면 더 많은 공기를 보내고, 전력이 높으면 에너지를 더 씁니다.', en:'Fans that move air. Higher airflow means more air, higher power means more energy use.' },
    eqPumps:        { ko:'냉수나 온수를 보내주는 펌프입니다. 유량이 크면 물을 더 많이 보냅니다.', en:'Pumps circulating chilled/hot water. Higher flow rate means more water circulation.' },
    eqCentral:      { ko:'칠러(냉동기)와 보일러 같은 중앙 열원 장비입니다. 건물 전체에 냉난방 에너지를 만들어줍니다.', en:'Central plant (chillers, boilers) that generate heating/cooling for the whole building.' },
    szZoneCooling:  { ko:'각 존(공간)별로 여름 최고점에서 얼마나 냉방이 필요한지 계산한 결과입니다.', en:'Cooling capacity calculated per zone at peak summer conditions.' },
    szZoneHeating:  { ko:'각 존(공간)별로 겨울 최고점에서 얼마나 난방이 필요한지 계산한 결과입니다.', en:'Heating capacity calculated per zone at peak winter conditions.' },
    szSystemAir:    { ko:'공조 시스템 전체가 얼마나 공기를 보내야 하는지 산정한 풍량입니다.', en:'Total airflow the HVAC system needs to deliver.' },
    szCoilSizing:   { ko:'각 코일이 처리해야 할 최대 용량을 정리한 표입니다.', en:'Maximum capacity each coil needs to handle.' },
    ventAvgOA:      { ko:'사람이 있는 시간 동안 각 존에 들어오는 신선한 외부 공기의 평균 양입니다.', en:'Average fresh outdoor air supplied to each zone when occupied.' },
    ventMechByZone: { ko:'각 존에 얼마나 환기를 해야 하는지 설계 기준에 따라 계산한 값입니다.', en:'Ventilation requirements per zone based on ASHRAE 62.1 design standards.' },
    ventStd621:     { ko:'ASHRAE 62.1 환기 기준에 따라 계산된 존별 필요 환기량입니다.', en:'Zone ventilation requirements per ASHRAE Standard 62.1.' },
    envOpaque:      { ko:'외벽, 지붕 등 불투명한 외피입니다. 열관류율(U-Factor)이 낮을수록 단열이 잘 됩니다.', en:'Opaque surfaces (walls, roofs). Lower U-Factor = better insulation.' },
    envFenestration:{ ko:'창문과 유리의 열 성능입니다. SHGC가 낮으면 햇빛 차단이 잘 되고, U-Factor가 낮으면 단열이 좋습니다.', en:'Window thermal performance. Lower SHGC = less solar heat, lower U-Factor = better insulation.' },
    sensHeatCooling:{ ko:'냉방이 가장 필요한 순간에 열이 어디서 오는지 분석한 결과입니다. 가장 큰 값이 냉방 부하의 주원인입니다.', en:'Where heat comes from at cooling peak. Largest values are the main cooling load drivers.' },
    sensHeatHeating:{ ko:'난방이 가장 필요한 순간에 열이 어디로 빠지는지 분석한 결과입니다.', en:'Where heat is lost at heating peak.' }
  };

  function getSectionDesc(key) { var d = SECTION_DESC[key]; return d ? d[lang] || d.en : ''; }

  function buildAccordion(containerId, sections) {
    var container = $id(containerId);
    if (!container) return;
    container.innerHTML = '';
    var rendered = 0;
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      if (!s.data || s.data.length === 0) continue;
      rendered++;
      var secId = containerId + '_' + i;
      var tableId = secId + '_tbl';
      var count = s.data.length;
      var desc = getSectionDesc(s.descKey);
      var filterable = count > 8;

      var html = '<div class="accordion-section" id="' + secId + '">';
      html += '<div class="accordion-header" data-target="' + secId + '_body">';
      html += '<span class="accordion-arrow">&#9660;</span>';
      html += '<span class="accordion-title">' + escHtml(s.title) + '</span>';
      html += '<span class="accordion-badge">' + count + (lang==='ko'?' 행':' rows') + '</span>';
      html += '</div>';
      if (desc) html += '<div class="accordion-desc">' + escHtml(desc) + '</div>';
      html += '<div class="accordion-body" id="' + secId + '_body">';
      if (filterable) {
        html += '<div class="table-filter-wrap">';
        html += '<span class="table-filter-label">' + (lang==='ko'?'검색:':'Filter:') + '</span>';
        html += '<input type="text" class="table-filter-input" data-table="' + tableId + '" placeholder="' + (lang==='ko'?'이름이나 값으로 검색...':'Search by name or value...') + '">';
        html += '<span class="table-row-count" id="' + tableId + '_count">' + count + '/' + count + '</span>';
        html += '</div>';
      }
      html += '<div class="table-section"><div class="table-scroll"><table id="' + tableId + '" class="data-table"></table></div></div>';
      html += '</div></div>';
      container.insertAdjacentHTML('beforeend', html);

      // Render the table data
      renderDataTable(tableId, s.data, { noInfo: false });
    }
    if (rendered === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128196;</div><div class="empty-msg">' + t('noData') + '</div></div>';
    }
    // Bind accordion toggle events
    var headers = container.querySelectorAll('.accordion-header');
    for (var j = 0; j < headers.length; j++) {
      headers[j].addEventListener('click', function() {
        var targetId = this.getAttribute('data-target');
        var body = $id(targetId);
        if (body) {
          this.classList.toggle('open');
          body.classList.toggle('open');
        }
      });
    }
    // Bind filter events
    var filters = container.querySelectorAll('.table-filter-input');
    for (var k = 0; k < filters.length; k++) {
      filters[k].addEventListener('input', function() {
        var tblId = this.getAttribute('data-table');
        var q = this.value.toLowerCase();
        var tbl = $id(tblId);
        if (!tbl) return;
        var rows = tbl.querySelectorAll('tbody tr');
        var shown = 0;
        for (var ri = 0; ri < rows.length; ri++) {
          var txt = rows[ri].textContent.toLowerCase();
          var vis = !q || txt.indexOf(q) !== -1;
          rows[ri].style.display = vis ? '' : 'none';
          if (vis) shown++;
        }
        var countEl = $id(tblId + '_count');
        if (countEl) countEl.textContent = shown + '/' + rows.length;
      });
    }
    // Auto-open first accordion
    var firstHeader = container.querySelector('.accordion-header');
    if (firstHeader) firstHeader.click();
  }

  /* ===== EQUIPMENT & SIZING TAB ===== */
  function renderEquipment() {
    var idx = parseInt($id('selEquipReport').value) || 0;
    if (!reports[idx]) return;
    var r = reports[idx];
    buildAccordion('accordionEquipment', [
      { title: t('eqCoolingCoils'), descKey:'eqCoolingCoils', data: r.equipment.coolingCoils || [] },
      { title: t('eqHeatingCoils'), descKey:'eqHeatingCoils', data: r.equipment.heatingCoils || [] },
      { title: t('eqFans'), descKey:'eqFans', data: r.equipment.fans || [] },
      { title: t('eqPumps'), descKey:'eqPumps', data: r.equipment.pumps || [] },
      { title: t('eqCentral'), descKey:'eqCentral', data: r.equipment.centralPlant || [] }
    ]);
    buildAccordion('accordionSizing', [
      { title: t('szZoneCooling'), descKey:'szZoneCooling', data: r.hvacSizing.zoneCooling || [] },
      { title: t('szZoneHeating'), descKey:'szZoneHeating', data: r.hvacSizing.zoneHeating || [] },
      { title: t('szSystemAir'), descKey:'szSystemAir', data: r.hvacSizing.systemAirFlow || [] },
      { title: t('szCoilSizing'), descKey:'szCoilSizing', data: r.hvacSizing.coilSizing || [] }
    ]);
  }

  /* ===== VENTILATION & ENVELOPE TAB ===== */
  function renderVentilation() {
    var idx = parseInt($id('selVentReport').value) || 0;
    if (!reports[idx]) return;
    var r = reports[idx];
    buildAccordion('accordionVent', [
      { title: t('ventAvgOA'), descKey:'ventAvgOA', data: r.outdoorAir.average || [] },
      { title: t('ventMechByZone'), descKey:'ventMechByZone', data: r.outdoorAir.mechVentByZone || [] },
      { title: t('ventStd621'), descKey:'ventStd621', data: r.standard621.zoneParams || [] }
    ]);
    buildAccordion('accordionEnv', [
      { title: t('envOpaque'), descKey:'envOpaque', data: r.envelope.opaqueExterior || [] },
      { title: t('envFenestration'), descKey:'envFenestration', data: r.envelope.exteriorFenestration || [] }
    ]);
    buildAccordion('accordionSensHeat', [
      { title: t('sensHeatCooling'), descKey:'sensHeatCooling', data: r.sensibleHeatGain.peakCooling || [] },
      { title: t('sensHeatHeating'), descKey:'sensHeatHeating', data: r.sensibleHeatGain.peakHeating || [] }
    ]);
  }

  /* ===== REPORT COMPARE TAB ===== */
  function renderCompare() {
    var hint = $id('compareHint');
    var peakSec = $id('comparePeakSection');
    var zoneChartSec = $id('compareZoneChartSection');

    if (reports.length < 2) {
      hint.textContent = t('compareHint'); hint.style.display = '';
      peakSec.style.display = 'none'; if (zoneChartSec) zoneChartSec.style.display = 'none';
      return;
    }
    hint.style.display = 'none';
    var hasPeak = reports.some(function(r){ return r.peakLoads.cooling.length>0||r.peakLoads.heating.length>0; });
    if (hasPeak) { peakSec.style.display = ''; renderComparePeak(); } else peakSec.style.display = 'none';
    // Monthly comparison removed - not relevant for K-HVAC design-day
    var hasZones = reports.some(function(r){ return r.zones.length>0; });
    if (hasZones) { zoneChartSec.style.display = ''; renderCompareZoneChart(); } else zoneChartSec.style.display = 'none';
  }

  function renderComparePeak() {
    var mode = comparePeakMode;
    $id('compareChartTitle').textContent = mode === 'cooling' ? t('comparePeakCooling') : t('comparePeakHeating');
    if (charts.comparePeak) { charts.comparePeak.destroy(); delete charts.comparePeak; }
    var compSet = {};
    for (var i = 0; i < reports.length; i++) {
      var d = mode === 'cooling' ? reports[i].peakLoads.cooling : reports[i].peakLoads.heating;
      for (var j = 0; j < d.length; j++) { var n = rowName(d[j]); if (!/grand\s*total/i.test(n) && n) compSet[n] = true; }
    }
    var components = Object.keys(compSet);
    var datasets = [];
    for (var ri = 0; ri < Math.min(reports.length, 6); ri++) {
      var rData = mode === 'cooling' ? reports[ri].peakLoads.cooling : reports[ri].peakLoads.heating;
      var vals = components.map(function(comp) { var row = rData.find(function(r){ return rowName(r) === comp; }); return row ? Math.abs(convVal(row['Total [Btu/h]']||0, 'Btu/h')) : 0; });
      datasets.push({ label: reports[ri].fileName, data: vals, backgroundColor: REPORT_COLORS[ri]+'bb', borderColor: REPORT_COLORS[ri], borderWidth:1, borderRadius:3 });
    }
    var compLabels = components;
    charts.comparePeak = new Chart($id('chartComparePeak'), {
      type: 'bar', data: { labels: compLabels, datasets: datasets },
      options: { indexAxis:'y', responsive:true, maintainAspectRatio:false, scales:{ x:{ beginAtZero:true, ticks:{ callback: function(v){ return fmtNum(v); } } } }, plugins:{ tooltip:{ callbacks:{ label:function(ctx){ return ctx.dataset.label+': '+fmtNum(ctx.raw)+' '+(unitMode==='si'?'W':'Btu/h'); } } } },
        onClick: function(evt, elements) {
          if (elements.length > 0) {
            var idx2 = elements[0].index;
            highlightTableRow('tableComparePeak', compLabels[idx2].toLowerCase());
          }
        }
      }
    });
    renderComparePeakTable(components, mode);
  }

  function renderComparePeakTable(components, mode) {
    var table = $id('tableComparePeak');
    var n = Math.min(reports.length, 6);
    var html = '<thead><tr><th style="text-align:left">' + t('component') + '</th>';
    for (var ri = 0; ri < n; ri++) html += '<th>' + escHtml(reports[ri].fileName) + '</th>';
    if (n === 2) html += '<th>' + t('delta') + '</th><th>' + t('pctChange') + '</th>';
    html += '</tr></thead><tbody>';
    var allRows = components.concat(['Grand Total']);
    for (var ci = 0; ci < allRows.length; ci++) {
      var comp = allRows[ci]; var isGT = /grand\s*total/i.test(comp);
      html += '<tr data-comp="' + escAttr(comp.toLowerCase()) + '"' + (isGT ? ' style="font-weight:700;background:rgba(59,130,246,0.05)"' : '') + '>';
      html += '<td style="text-align:left" class="comp-name-cell">' + escHtml(comp) + '</td>';
      var vals = [];
      for (var r = 0; r < n; r++) {
        var d = mode === 'cooling' ? reports[r].peakLoads.cooling : reports[r].peakLoads.heating;
        var row = d.find(function(x){ return isGT ? /grand\s*total/i.test(rowName(x)) : rowName(x) === comp; });
        var v = row ? (row['Total [Btu/h]']||0) : 0; vals.push(v);
        html += '<td>' + fmtTable(convVal(v, 'Btu/h')) + '</td>';
      }
      if (n === 2) {
        var delta = vals[1] - vals[0];
        var pct = vals[0] !== 0 ? ((delta / Math.abs(vals[0])) * 100) : 0;
        var cls = mode === 'cooling' ? (delta < 0 ? 'cell-better' : delta > 0 ? 'cell-worse' : '') : (delta > 0 ? 'cell-better' : delta < 0 ? 'cell-worse' : '');
        html += '<td class="' + cls + '">' + fmtTable(convVal(delta, 'Btu/h')) + '</td>';
        html += '<td class="' + cls + '">' + (vals[0] !== 0 ? pct.toFixed(1) + '%' : '-') + '</td>';
      }
      html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;

    // Bind click on component names in compare table → scroll to chart bar
    var cmpCells = table.querySelectorAll('.comp-name-cell');
    for (var cc = 0; cc < cmpCells.length; cc++) {
      cmpCells[cc].addEventListener('click', function() {
        var name = this.textContent.trim();
        scrollToChartBar('comparePeak', name);
      });
    }

    // Bind Grand Total row click → scroll to compare chart and highlight all
    var gtRow = table.querySelector('tr[data-comp="grand total"]');
    if (gtRow) {
      gtRow.addEventListener('click', function() {
        scrollToChartAndHighlightAll('comparePeak');
      });
    }
  }

  // renderCompareMonthly removed — not relevant for K-HVAC design-day analysis

  function renderCompareZoneChart() {
    if (charts.compareZones) { charts.compareZones.destroy(); delete charts.compareZones; }
    var labels = [], volumeData = [], wallData = [];
    for (var i = 0; i < Math.min(reports.length, 6); i++) {
      var total = reports[i].zones.find(function(z){ return /^total$/i.test(rowName(z)); });
      labels.push(reports[i].fileName.replace(/\.html?$/i,'').substring(0,30));
      volumeData.push(total ? convVal(total['Volume [ft3]']||0, 'Volume [ft3]') : 0);
      wallData.push(total ? convVal(total['Above Ground Gross Wall Area [ft2]']||0, 'Above Ground Gross Wall Area [ft2]') : 0);
    }
    charts.compareZones = new Chart($id('chartCompareZones'), {
      type:'bar', data:{ labels:labels, datasets:[
        { label: convHeader('Volume [ft3]'), data:volumeData, backgroundColor:'rgba(59,130,246,0.7)', yAxisID:'y', borderRadius:4 },
        { label: convHeader('Above Ground Gross Wall Area [ft2]'), data:wallData, backgroundColor:'rgba(239,68,68,0.7)', yAxisID:'y1', borderRadius:4 }
      ]},
      options:{ responsive:true, maintainAspectRatio:false, scales:{
        y:{type:'linear',position:'left',title:{display:true,text:convHeader('Volume [ft3]')},beginAtZero:true},
        y1:{type:'linear',position:'right',title:{display:true,text:convHeader('Area [ft2]')},beginAtZero:true,grid:{drawOnChartArea:false}}
      }}
    });
  }

  /* ===== ZONE COMPARE TAB ===== */
  var allZoneNames = [];
  var highlightedZone = null;

  function renderZoneCompare() {
    var hint = $id('zoneCompareHint');
    var content = $id('zoneCompareContent');
    if (reports.length < 2) {
      hint.style.display = ''; content.style.display = 'none'; return;
    }
    hint.style.display = 'none'; content.style.display = '';
    populateZoneFilter();
    renderZoneCompareCards();
  }

  function populateZoneFilter() {
    var sel = $id('selZoneFilter');
    var search = $id('zoneSearchInput');
    var prev = sel.value;
    var zoneSet = {};
    for (var ri = 0; ri < reports.length; ri++) {
      for (var zi = 0; zi < reports[ri].zones.length; zi++) {
        var name = rowName(reports[ri].zones[zi]);
        if (name && !/conditioned total|unconditioned|not part/i.test(name)) zoneSet[name] = true;
      }
    }
    allZoneNames = Object.keys(zoneSet).sort();
    sel.innerHTML = '';
    var optAll = document.createElement('option');
    optAll.value = '__all__'; optAll.textContent = t('allZones');
    sel.appendChild(optAll);
    for (var i = 0; i < allZoneNames.length; i++) {
      var opt = document.createElement('option');
      opt.value = allZoneNames[i]; opt.textContent = allZoneNames[i];
      sel.appendChild(opt);
    }
    if (prev) { for (var j = 0; j < sel.options.length; j++) { if (sel.options[j].value === prev) { sel.value = prev; break; } } }
    if (search) search.value = '';
    hideAutoComplete();
  }

  function showAutoComplete(query) {
    var ac = $id('zoneAutoComplete');
    if (!ac) return;
    var q = query.toLowerCase().trim();
    if (!q) { ac.style.display = 'none'; return; }
    var matches = allZoneNames.filter(function(n) { return n.toLowerCase().indexOf(q) !== -1; });
    if (matches.length === 0) { ac.style.display = 'none'; return; }
    var html = '';
    for (var i = 0; i < Math.min(matches.length, 12); i++) {
      var name = matches[i];
      var idx = name.toLowerCase().indexOf(q);
      var display = escHtml(name.substring(0, idx)) + '<span class="ac-match">' + escHtml(name.substring(idx, idx + q.length)) + '</span>' + escHtml(name.substring(idx + q.length));
      html += '<div class="autocomplete-item" data-zone="' + escAttr(name) + '">' + display + '</div>';
    }
    ac.innerHTML = html;
    ac.style.display = '';
    var items = ac.querySelectorAll('.autocomplete-item');
    for (var j = 0; j < items.length; j++) {
      items[j].addEventListener('click', function() {
        var zn = this.getAttribute('data-zone');
        $id('zoneSearchInput').value = '';
        hideAutoComplete();
        selectAndHighlightZone(zn);
      });
    }
  }

  function hideAutoComplete() { var ac = $id('zoneAutoComplete'); if (ac) ac.style.display = 'none'; }

  function selectAndHighlightZone(zoneName) {
    var sel = $id('selZoneFilter');
    sel.value = '__all__';
    highlightedZone = zoneName;
    renderZoneCompareCards();
    setTimeout(function() {
      var card = document.querySelector('.zone-card.highlighted');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  function renderZoneCompareCards() {
    var container = $id('zoneCompareCards');
    if (!container) return;
    if (reports.length < 2) { container.innerHTML = ''; return; }

    var selectedZone = $id('selZoneFilter').value;
    var zoneNames = allZoneNames.slice();
    if (selectedZone && selectedZone !== '__all__') zoneNames = zoneNames.filter(function(z){ return z === selectedZone; });

    var compareCols = ['Area [ft2]','Volume [ft3]','Above Ground Gross Wall Area [ft2]','Window Glass Area [ft2]','Lighting [Btu/h-ft2]','People [ft2 per person]','Plug and Process [Btu/h-ft2]'];
    var n = Math.min(reports.length, 4);
    var isDuo = n === 2;
    var html = '';

    for (var zi = 0; zi < zoneNames.length; zi++) {
      var zn = zoneNames[zi];
      var isHL = highlightedZone === zn;
      var isOpen = isHL || (selectedZone !== '__all__' && zoneNames.length <= 3);
      var cardId = 'zcard_' + zi;

      // Get summary for card header
      var row0 = null;
      for (var sr = 0; sr < reports.length; sr++) { row0 = reports[sr].zones.find(function(z){ return rowName(z) === zn; }); if (row0) break; }
      var summaryParts = [];
      if (row0) {
        var area = row0['Area [ft2]']; if (typeof area === 'number' && area > 0) summaryParts.push(fmtTable(convVal(area, 'Area [ft2]')) + (unitMode==='si'?' m\u00B2':' ft\u00B2'));
        var vol = row0['Volume [ft3]']; if (typeof vol === 'number' && vol > 0) summaryParts.push(fmtTable(convVal(vol, 'Volume [ft3]')) + (unitMode==='si'?' m\u00B3':' ft\u00B3'));
      }

      html += '<div class="zone-card' + (isHL ? ' highlighted' : '') + (isOpen ? ' open' : '') + '" id="' + cardId + '">';
      html += '<div class="zone-card-header" data-card="' + cardId + '">';
      html += '<span class="zone-card-name">' + escHtml(zn) + '</span>';
      if (summaryParts.length > 0) html += '<span class="zone-card-summary">' + summaryParts.map(function(s){ return '<span>' + s + '</span>'; }).join('') + '</span>';
      html += '<span class="zone-card-arrow">&#9660;</span>';
      html += '</div>';
      html += '<div class="zone-card-body">';

      // Comparison table for this zone
      html += '<div class="table-scroll"><table class="data-table">';
      html += '<thead><tr><th style="text-align:left">' + t('metric') + '</th>';
      for (var ri = 0; ri < n; ri++) html += '<th>' + escHtml(reports[ri].fileName.replace(/\.html?$/i,'').substring(0,28)) + '</th>';
      if (isDuo) html += '<th>' + t('zoneDiff') + '</th><th>' + t('zoneDiffPct') + '</th>';
      html += '</tr></thead><tbody>';

      for (var ci = 0; ci < compareCols.length; ci++) {
        var col = compareCols[ci];
        html += '<tr><td style="text-align:left">' + convHeader(col) + '</td>';
        var vals = [];
        for (var ri2 = 0; ri2 < n; ri2++) {
          var zoneRow = reports[ri2].zones.find(function(z){ return rowName(z) === zn; });
          var v = zoneRow ? (typeof zoneRow[col] === 'number' ? zoneRow[col] : parseFloat(zoneRow[col]) || 0) : 0;
          vals.push(v);
          html += '<td>' + fmtTable(convVal(v, col)) + '</td>';
        }
        if (isDuo) {
          var d = vals[1] - vals[0];
          var pct = vals[0] !== 0 ? ((d / Math.abs(vals[0])) * 100) : 0;
          var cls = Math.abs(d) < 0.01 ? '' : (d > 0 ? 'cell-worse' : 'cell-better');
          html += '<td class="' + cls + '">' + fmtTable(d) + '</td>';
          html += '<td class="' + cls + '">' + (vals[0] === 0 && vals[1] === 0 ? '-' : pct.toFixed(1) + '%') + '</td>';
        }
        html += '</tr>';
      }
      html += '</tbody></table></div></div></div>';
    }

    if (zoneNames.length === 0) {
      html = '<div class="empty-state"><div class="empty-icon">&#128269;</div><div class="empty-msg">' + t('noData') + '</div></div>';
    }

    container.innerHTML = html;

    // Bind card toggle
    var headers = container.querySelectorAll('.zone-card-header');
    for (var h = 0; h < headers.length; h++) {
      headers[h].addEventListener('click', function() {
        var card = $id(this.getAttribute('data-card'));
        if (card) card.classList.toggle('open');
      });
    }
  }

  /* ===== Empty chart placeholder ===== */
  function showEmptyChart(canvasOrId, msg) {
    var canvas = typeof canvasOrId === 'string' ? $id(canvasOrId) : canvasOrId;
    if (!canvas) return;
    var parent = canvas.parentElement;
    var canvasId = canvas.id;
    if (parent) parent.innerHTML = '<div class="empty-state" data-canvas-id="' + canvasId + '"><div class="empty-icon">&#128202;</div><div class="empty-msg">' + escHtml(msg) + '</div><div class="empty-hint">' + t('designDayNote') + '</div></div>';
  }
  function ensureCanvas(canvasId) {
    var c = $id(canvasId);
    if (c) return c;
    var placeholder = document.querySelector('[data-canvas-id="' + canvasId + '"]');
    if (placeholder && placeholder.parentElement) { placeholder.parentElement.innerHTML = '<canvas id="' + canvasId + '"></canvas>'; return $id(canvasId); }
    return null;
  }

  /* ===== Theme ===== */
  function toggleTheme() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    updateThemeIcon();
  }
  function updateThemeIcon() {
    $id('themeIcon').innerHTML = document.documentElement.getAttribute('data-theme') === 'dark' ? '&#9788;' : '&#9790;';
  }

  /* ===== Toast ===== */
  function toast(msg, type) {
    toastEl.textContent = msg;
    toastEl.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(function () { toastEl.className = 'toast'; }, 3000);
  }

  /* ===== Formatters ===== */
  function fmtNum(n) {
    if (typeof n !== 'number') return String(n);
    if (Math.abs(n) >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (Math.abs(n) >= 1) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (n === 0) return '0';
    return n.toFixed(4);
  }
  function fmtTable(v) {
    if (typeof v !== 'number') return escHtml(String(v || ''));
    if (v === 0) return '0.00';
    if (Math.abs(v) >= 100) return v.toLocaleString('en-US', { maximumFractionDigits: 1 });
    if (Math.abs(v) >= 0.01) return v.toFixed(2);
    return v.toFixed(4);
  }
  function escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function escAttr(s) { return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;'); }

  /* ===== Boot ===== */
  init();
})();
