# ☀️ Revit Solar Analysis (레빗 태양열 해석) 가이드

![Solar Analysis 결과 - 태양 경로와 히트맵 시각화](../images/solar_result_sunpath_overview.png)

---

## 1. Overview (개요)

Revit의 **Solar Analysis(태양열 해석)** 기능은 건물의 형태, 방위, 그리고 실제 지리적 기상 데이터를 기반으로 건물 표면에 도달하는 태양 복사열(일사량)을 시뮬레이션하는 BIM 데이터 분석 도구입니다.

**실무 활용 목적:**
* **Data-Driven Design (데이터 기반 설계):** 초기 매스 스터디 단계에서 형태와 방위에 따른 환경적 영향을 수치화하여 객관적인 설계 근거 마련.
* **태양광(PV) 패널 최적화:** 지붕 및 입면의 연간 일사량을 분석하여 태양광 패널 설치의 최적 위치와 경제성(투자 회수 기간) 평가.
* **친환경 건축 다이어그램:** 분석된 히트맵(Heat-map) 그래픽을 추출하여 직관적이고 전문적인 프레젠테이션 시각 자료로 활용.

---

## 2. Main Interface Options (메인 인터페이스 드롭다운 옵션)

본격적인 세부 설정(Study Settings)에 들어가기에 앞서, 분석의 기본적인 방향을 결정하는 메인 창의 드롭다운 설정 항목입니다.

<details>
<summary><strong>1. Study Type (해석 유형)</strong></summary>

![Study Type 드롭다운 - Custom / Solar Energy - Annual PV](../images/solar_study_type_dropdown.png)

* **Custom (사용자 지정):** 일반적인 건물 표면의 일사량(Insolation) 분포를 분석할 때 사용합니다. 매스 스터디나 입면의 형태적 영향을 파악하는 데 적합합니다.
* **Solar Energy - Annual PV (태양광 에너지 - 연간 PV):** 단순 일사량을 넘어, 태양광 패널을 설치했을 때의 실제 전력 생산량과 경제성(에너지 절감액, 투자 회수 기간 등)을 상세히 시뮬레이션할 때 선택합니다.

</details>

<details>
<summary><strong>2. Surfaces (표면 / 분석 대상)</strong></summary>

![Surfaces 드롭다운 - user selection / All Roof / All Mass Faces](../images/solar_surfaces_dropdown.png)

* **&lt;user selection&gt; (사용자 지정 선택):** 마우스를 이용해 3D 뷰에서 분석하고자 하는 특정 지붕이나 외벽 면을 직접 클릭하여 지정합니다.
* **All Roof Exterior Surfaces (모든 지붕 외부 표면):** 모델링된 객체 중 '지붕(Roof)' 카테고리로 인식되는 모든 외부 표면을 시스템이 자동으로 선택하여 분석합니다.
* **All Mass Faces (모든 매스 표면):** 설계 초기 단계에서 생성한 개념 매스(Mass)의 모든 표면을 한 번에 분석 대상으로 잡을 때 유용합니다.

> ⚠️ **[주의] Surface Selection (표면 선택) 가이드 및 한계점**
>
> ![Surface Selection 경고 메시지](../images/solar_surface_selection_warning.png)
>
> `<user selection>`을 선택할 때 나타나는 경고 메시지의 핵심 요약입니다. 분석 결과가 0으로 나오는 오류를 방지하기 위해 반드시 숙지해야 합니다.
>
> * **✅ 분석 지원 대상 (권장):** 매스(Mass) 표면, 그리고 기본 건축 요소인 벽(Walls), 바닥(Floors), 지붕(Roofs), 천장(Ceilings)의 표면.
> * **❌ 분석 미지원 대상 (결과값이 0에 가깝게 나옴):** 창문 유리, 복잡한 패밀리(Families), 그룹 객체, 컴포넌트, 링크된 모델(Linked objects), 가져온 형상(Imported geometry), 에너지 분석 모델 표면.
> * **🔍 유리(Glass)의 특성:** 모든 유리는 100% 투명한 것으로 간주되어 햇빛이 표면에 맺히지 않고 그대로 통과하는 것으로 계산됩니다.
> * **💡 실무 팁:** 분석 시 복잡한 창틀이나 링크 파일 등은 제외하고, 순수한 **매스 표면이나 주요 구조체(벽, 지붕) 위주로 선택**해야 정확한 일사량 데이터를 얻을 수 있습니다.

</details>

<details>
<summary><strong>3. Results Settings - Type (결과 유형)</strong></summary>

![Results Type 드롭다운 - Cumulative Insolation / PV Energy / Payback Period](../images/solar_results_type_dropdown.png)

* **Cumulative Insolation (누적 일사량):** 지정된 기간(예: 1년) 동안 표면에 쌓인 태양 에너지의 총합(kWh/m²)을 보여줍니다.
* **PV Energy (태양광 생산 에너지):** 패널 효율을 반영하여 실제로 얼마만큼의 전력(kWh)을 생산할 수 있는지 도출합니다. (Study Type을 PV로 맞췄을 때 활성화)
* **Payback Period (years) (투자 회수 기간):** 설치 비용 대비 전기 요금 절감액을 계산하여, 패널 투자 비용을 몇 년(years) 안에 회수할 수 있는지 경제성 지표로 보여줍니다.

</details>

---

## 3. Study Settings (해석 세부 설정)

시뮬레이션의 정확도와 경제성 분석의 기준이 되는 환경 및 패널 변수를 설정하는 창입니다. (Update 버튼 위 톱니바퀴 아이콘 클릭)

![Study Settings 다이얼로그](../images/solar_study_settings.png)

* **Weather Data (기상 데이터):** 프로젝트에 설정된 위치(위도/경도)를 기반으로 한 가장 가까운 기상 관측소의 데이터.
* **Analysis Period (해석 기간):** 시뮬레이션을 진행할 기간. (예: `Full Annual` - 1년 전체 누적 데이터 도출)
* **Building Area (건물 면적):** 대상 건물의 대략적인 연면적 (경제성 계산 시 참조값).
* **Building Energy (건물 에너지):** 면적당 에너지 사용 강도인 **EUI (Energy Use Intensity, kWh/m²/year)**.
* **Electricity Cost (전기 요금):** 단위 전력당 전기 요금 (예: ₩/kWh) 및 요금 상승률(% escalation). 태양광 패널 설치 시 절감되는 비용을 계산하는 척도.
* **Panel Type (패널 유형):** 적용할 태양광 패널의 발전 효율(%)과 설치 단가($/Watt).
* **Coverage (설치 면적 비율):** 선택된 지붕/입면 면적 중 실제 태양광 패널로 덮일 수 있는 비율(%). 옥상 설비 공간 등을 고려해 보통 60~80%로 설정하는 것이 현실적임.
* **Payback Filter (투자 회수 필터):** 패널 설치 비용을 회수하는 데 걸리는 제한 연수. 주변 건물에 의한 음영 등으로 인해 효율이 떨어져 설정 기간 내 비용 회수가 불가능한 영역은 분석에서 제외함.
* **Analysis Grid (해석 그리드):** 모델 표면을 쪼개어 계산하는 해상도.
  * *Coarse (성김) ↔ Fine (촘촘함).* 그리드가 촘촘할수록 포인트가 늘어나 계산 시간은 길어지지만, 다이어그램 추출 시 훨씬 부드럽고 정교한 히트맵을 얻을 수 있음.

---

## 4. Analysis Results (분석 결과 이해하기)

시뮬레이션 완료 후 창에 표시되는 핵심 결과값입니다.

![Solar Analysis 결과 화면 - Custom 모드 일사량 분석 결과](../images/solar_analysis_result_custom.png)

* **Selected Surface Area (분석 대상 면적): 7,128 m²**
  * The total area of the roof and facade selected for the simulation. (시뮬레이션을 위해 선택된 지붕 및 외벽의 총면적입니다.)
* **Cumulative Insolation (연간 누적 일사량): 1,104,227 kWh**
  * The total solar energy received by the selected surfaces over one year. (선택된 면적이 1년 동안 받는 총 태양 에너지량입니다. 이 수치가 높을수록 수집 가능한 태양 에너지가 많음을 의미합니다.)
* **Average Insolation (연간 평균 일사량): 155 kWh/m²**
  * The average energy intensity per unit area over the course of a year. (단위 면적당 1년간 도달하는 평균 에너지의 강도입니다.)

---

## 5. Analysis Display Styles (해석 화면표시 스타일)

결괏값을 3D 뷰에 어떤 색상 스케일과 형식으로 매핑할지 결정하는 시각화 템플릿입니다.

### 1) 연간 분석 템플릿 (Annual Series)

1년 동안 누적되는 대량의 태양 에너지를 확인할 때 사용합니다. (단위: kWh)

* **Solar Analysis Annual 200kWh / 500kWh:** 연간 누적 일사량의 색상 스케일 최댓값을 각각 200kWh, 500kWh로 고정. 일사량이 낮은 지역 분석 시 색상 대비를 뚜렷하게 보여줍니다.

| Solar Analysis Annual 200kWh | Solar Analysis Annual 500kWh |
|:---:|:---:|
| ![Annual 200kWh](../images/solar_style_annual_200kwh.png) | ![Annual 500kWh](../images/solar_style_annual_500kwh.png) |

* **Solar Analysis Annual Insolation:** 가장 표준적인 연간 일사량 스타일. 순수한 태양 복사열의 분포를 보여주며 일반적인 매스 스터디 다이어그램에 가장 많이 쓰입니다.

![Solar Analysis Annual Insolation](../images/solar_style_annual_insolation.png)

### 2) 일간 및 시간당 분석 템플릿 (Daily & Hourly Series)

특정 날짜나 시간대처럼 짧은 기간의 에너지를 분석할 때 사용합니다.

* **Solar Analysis Daily 2kWh / 5kWh / 10kWh:** 하루 동안 누적되는 일사량을 확인. (최댓값 기준: 2, 5, 10 kWh)
* **Solar Analysis Hourly 200Wh / 500Wh / 1000Wh:** 특정 1시간 동안의 일사량을 확인. 단위도 1,000배 작은 **Wh(와트시)**를 사용하며 한여름 정오의 직사광선을 파악할 때 유용합니다.

| Solar Analysis Daily 3kWh | Solar Analysis Hourly 200Wh |
|:---:|:---:|
| ![Daily 3kWh](../images/solar_style_daily_3kwh.png) | ![Hourly 200Wh](../images/solar_style_hourly_200wh.png) |

### 3) 기본 및 점 스타일 (Default Series)

* **Solar Analysis Default:** 레빗이 분석된 결괏값을 자동으로 파악하여 가장 적절하게 색상을 분배해 주는(Auto-scaling) 기본 스타일입니다.
* **Solar Analysis Default pts (Points):** 표면을 색칠하는 대신 계산된 지점마다 **색상이 들어간 점(Points)**으로 결괏값을 표현합니다.

| Solar Analysis Default | Solar Analysis Default pts |
|:---:|:---:|
| ![Default](../images/solar_style_default.png) | ![Default pts](../images/solar_style_default_pts.png) |

### 4) 태양광 발전 특화 템플릿 (PV Series)

태양광 패널(PV)을 설치했을 때 얻을 수 있는 **전기 생산량과 경제성**을 보여주는 스타일입니다.

* **Solar Analysis Annual PV Energy:** 단순 일사량에 패널의 발전 효율을 곱하여 **"실제로 생산할 수 있는 전기에너지(kWh)"**를 보여줍니다.
* **Solar Analysis PV Payback Period:** 단위가 에너지가 아닌 **'년(Years)'**으로 나옵니다. "투자 비용을 회수하는 데 몇 년이 소요되는지(투자 회수 기간)"를 색상으로 직관적으로 보여줍니다.

| Solar Analysis Annual PV Energy | Solar Analysis PV Payback Period |
|:---:|:---:|
| ![PV Energy](../images/solar_style_pv_energy.png) | ![PV Payback](../images/solar_style_pv_payback.png) |

---

## 6. 응용 방법 (Practical Tips)

### 1) 히트맵 다이어그램 추출

Analysis Display Style을 적용한 상태에서 3D 뷰를 캡처하면, 프레젠테이션용 일사량 히트맵 다이어그램으로 바로 활용할 수 있습니다. Analysis Grid를 **Fine** 쪽으로 설정할수록 더 부드럽고 정교한 그래픽을 얻을 수 있습니다.

### 2) 수치 데이터(CSV)로 내보내기 (엑셀 분석용)

Solar Analysis 창 하단의 **Results Settings(결과 설정)** 구역에 **Export(내보내기)** 항목이 있습니다.

**내보내기 순서:**
1. Export 드롭다운 메뉴가 **`Insolation csv`**로 되어 있는지 확인합니다.
2. 바로 오른쪽에 있는 **내보내기 버튼(문서 밖으로 나가는 화살표 아이콘)**을 클릭합니다.
3. 저장 경로를 지정하면 `.csv` 파일이 생성됩니다.

이 CSV 파일을 **엑셀(Excel)**에서 열면, 분석된 표면의 각 지점(Point) 좌표와 해당 지점의 정확한 일사량 수치 데이터가 포함되어 있습니다. 이를 가공하여 표나 그래프를 만들 때 유용합니다.
