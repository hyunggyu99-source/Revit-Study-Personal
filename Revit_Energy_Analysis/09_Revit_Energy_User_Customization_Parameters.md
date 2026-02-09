# 09. Revit Energy Analysis User Customization Parameters

본 문서는 Revit 에너지 해석에서 **사용자가 직접 설정 가능한 파라미터**와 각 설정이 **시뮬레이션 결과에 미치는 영향**을 체계적으로 정리한 기술 문서입니다.

---

## 1. 개요

Revit/Insight 에너지 해석은 클라우드 기반 시뮬레이션으로, 일부 핵심 파라미터는 Autodesk 서버에서 고정되어 있으나, 다수의 입력값은 사용자 정의가 가능합니다. 이러한 파라미터의 조정은 최종 에너지 소비량, 부하 산정, 설비 용량 계산에 직접적인 영향을 미칩니다.

### 1.1 사용자 설정 범위 분류

| 분류 | 설정 가능 여부 | 영향 범위 |
|:---|:---:|:---|
| **건물 외피 (Envelope)** | ✅ 가능 | 냉난방 부하 |
| **스케줄 (Schedules)** | ✅ 가능 | 전 항목 |
| **Zone Equipment** | △ 제한적 | HVAC 에너지 |
| **Air System (AHU)** | ✅ 가능 | HVAC 에너지 |
| **Timestep** | ❌ 불가 | - |

---

## 2. 스케줄 (Schedules) 설정

스케줄은 시간대별 운영 패턴을 정의하며, 에너지 해석 결과에 가장 큰 영향을 미치는 입력값 중 하나입니다.

### 2.1 Occupancy Schedule (재실 스케줄)

**정의:** 공간 내 재실자 수의 시간대별 비율 (0~100%)

| 설정 방향 | 결과 영향 | 영향받는 항목 |
|:---|:---|:---|
| **재실률 증가** | 에너지 소비 **증가** | Cooling Load, Latent Load, Ventilation |
| **재실률 감소** | 에너지 소비 **감소** | Cooling Load, Latent Load, Ventilation |

**상세 영향 메커니즘:**

| 부하 항목 | 영향 방향 | 기술적 근거 |
|:---|:---:|:---|
| **냉방 현열 부하 (Sensible)** | ↑ 증가 | 인체 발열량 약 75W/인 반영 |
| **냉방 잠열 부하 (Latent)** | ↑ 증가 | 인체 수분 방출 (호흡, 발한) 반영 |
| **환기 부하 (Ventilation)** | ↑ 증가 | ASHRAE 62.1 기준 인당 환기량 증가 |
| **난방 부하** | ↓ 감소 | 인체 발열이 내부 발열원으로 작용 |

**설정 위치:** `Analyze` → `Energy Settings` → `Detailed Model` → `Schedules`

---

### 2.2 Lighting Schedule (조명 스케줄)

**정의:** 조명 기기의 시간대별 가동률 (0~100%)

| 설정 방향 | 결과 영향 | 영향받는 항목 |
|:---|:---|:---|
| **점등 시간 증가** | 에너지 소비 **증가** | Interior Lighting, Cooling Load |
| **점등 시간 감소** | 에너지 소비 **감소** | Interior Lighting, Cooling Load |

**상세 영향 메커니즘:**

| 부하 항목 | 영향 방향 | 기술적 근거 |
|:---|:---:|:---|
| **조명 전력 소비** | ↑ 증가 | 직접적 전력 소비 증가 |
| **냉방 부하** | ↑ 증가 | 조명 발열이 실내 열획득으로 전환 (약 100% 전환) |
| **난방 부하** | ↓ 감소 | 겨울철 조명 발열이 난방 보조 역할 수행 |

**참고:** LED 조명은 발열량이 낮아 냉방 부하 영향이 상대적으로 감소합니다. Lighting Power Density (LPD) 값과 연계하여 해석됩니다.

---

### 2.3 Equipment Schedule (장비 스케줄)

**정의:** OA 기기(컴퓨터, 프린터 등) 및 기타 장비의 시간대별 가동률

| 설정 방향 | 결과 영향 | 영향받는 항목 |
|:---|:---|:---|
| **가동 시간 증가** | 에너지 소비 **증가** | Interior Equipment, Cooling Load |
| **가동 시간 감소** | 에너지 소비 **감소** | Interior Equipment, Cooling Load |

**상세 영향 메커니즘:**

| 부하 항목 | 영향 방향 | 기술적 근거 |
|:---|:---:|:---|
| **장비 전력 소비** | ↑ 증가 | Equipment Power Density (EPD) 기반 산정 |
| **냉방 부하** | ↑ 증가 | 장비 발열 100% 실내 열획득으로 반영 |
| **난방 부하** | ↓ 감소 | 겨울철 장비 발열이 난방 보조 역할 |

---

### 2.4 HVAC Operation Schedule (공조 운전 스케줄)

**정의:** 냉난방 및 환기 시스템의 운전 시간대

| 설정 방향 | 결과 영향 | 영향받는 항목 |
|:---|:---|:---|
| **운전 시간 증가** | 에너지 소비 **증가** | Heating, Cooling, Fans, Pumps |
| **운전 시간 감소** | 에너지 소비 **감소** | Heating, Cooling, Fans, Pumps |
| **예열/예냉 시간 추가** | 에너지 소비 **증가** | 피크 부하 분산, 쾌적성 향상 |

**주의사항:** 운전 시간 단축 시 **Unmet Hours** (설정온도 미충족 시간)가 증가할 수 있으므로, 재실 스케줄과의 정합성 검토가 필요합니다.

---

### 2.5 Setpoint Schedule (설정온도 스케줄)

**정의:** 시간대별 냉난방 설정온도

| 설정 방향 | 결과 영향 | 영향받는 항목 |
|:---|:---|:---|
| **냉방 설정온도 상향 (예: 24→26°C)** | 냉방 에너지 **감소** | Cooling, Fans |
| **냉방 설정온도 하향 (예: 24→22°C)** | 냉방 에너지 **증가** | Cooling, Fans |
| **난방 설정온도 상향 (예: 20→22°C)** | 난방 에너지 **증가** | Heating |
| **난방 설정온도 하향 (예: 20→18°C)** | 난방 에너지 **감소** | Heating |
| **야간 셋백 적용** | 총 에너지 **감소** | Heating, Cooling |

**정량적 참고치:**
- 냉방 설정온도 1°C 상향 시: 냉방 에너지 약 **3~5% 감소**
- 난방 설정온도 1°C 하향 시: 난방 에너지 약 **3~5% 감소**

---

## 3. 건물 외피 (Building Envelope) 설정

### 3.1 Construction Type (구조체 타입)

| 설정 항목 | 결과 영향 | 영향받는 항목 |
|:---|:---|:---|
| **단열 성능 향상 (U-value 감소)** | 냉난방 부하 **감소** | Heating, Cooling (Envelope) |
| **단열 성능 저하 (U-value 증가)** | 냉난방 부하 **증가** | Heating, Cooling (Envelope) |
| **열용량 증가 (Thermal Mass)** | 피크 부하 **감소**, 지연 | Peak Load Shifting |

### 3.2 Glazing Type (유리 타입)

| 설정 항목 | 결과 영향 | 영향받는 항목 |
|:---|:---|:---|
| **SHGC 감소 (차폐 유리)** | 냉방 부하 **감소**, 난방 부하 **증가** | Solar Heat Gain |
| **SHGC 증가 (투명 유리)** | 냉방 부하 **증가**, 난방 부하 **감소** | Solar Heat Gain |
| **U-value 감소 (단열 유리)** | 냉난방 부하 **감소** | Conduction |
| **VLT 감소 (착색 유리)** | 조명 에너지 **증가** (자연채광 감소) | Interior Lighting |

---

## 4. Zone Equipment 설정

### 4.1 커스터마이징 가능 범위

| 방법 | 가능 여부 | 설명 |
|:---|:---:|:---|
| **드롭다운 목록에 새 타입 추가** | ❌ 불가 | Autodesk 정의 목록 고정 |
| **기존 타입의 파라미터 수정** | ✅ 가능 | COP, 용량, 코일 타입 등 |
| **Analytical Space에 직접 할당** | ✅ 가능 | Space Properties에서 설정 |
| **gbXML 내보내기 후 외부 도구** | ✅ 가능 | OpenStudio/EnergyPlus에서 완전 커스텀 |

### 4.2 설정 가능 파라미터

드롭다운에서 타입 선택 후 다음 파라미터 조정이 가능합니다:

| 파라미터 | 설정 범위 | 결과 영향 |
|:---|:---|:---|
| **Heating Coil Type** | Electric / Hot Water / None | 난방 에너지원 결정 |
| **Cooling Source** | Chilled Water / DX / None | 냉방 효율 및 에너지원 |
| **Fan Type** | Variable / Constant | 송풍기 에너지 소비 |
| **Ventilation Source** | Dedicated / Coupled | 환기 부하 산정 방식 |

### 4.3 COP/효율 설정 영향

| 설정 방향 | 결과 영향 |
|:---|:---|
| **COP 증가 (고효율 장비)** | HVAC 에너지 소비 **감소** |
| **COP 감소 (저효율 장비)** | HVAC 에너지 소비 **증가** |

### 4.4 MEP 패밀리와의 관계

Revit MEP Mechanical Equipment 패밀리는 문서화/시공 목적으로 생성 가능하나, 해당 패밀리의 스펙 데이터가 Energy Analysis의 Zone Equipment로 **자동 매핑되지 않습니다**. 사용자가 수동으로 가장 유사한 타입을 선택한 후 파라미터를 입력해야 합니다.

완전한 커스터마이징이 필요한 경우 gbXML 내보내기 후 OpenStudio/EnergyPlus에서 HVAC 시스템을 재정의하는 워크플로우를 권장합니다.

---

## 5. Air System (AHU) 설정

### 5.1 Heat Exchanger (열교환기)

| 설정 | 결과 영향 | 영향받는 항목 |
|:---|:---|:---|
| **None (미설치)** | 환기 부하 **증가** | Heating (겨울), Cooling (여름) |
| **Sensible (현열 교환)** | 환기 부하 **감소** (온도만) | Heating, Cooling |
| **Enthalpy (전열 교환)** | 환기 부하 **대폭 감소** (온도+습도) | Heating, Cooling, Latent Load |

**정량적 참고치:** 전열교환기 적용 시 환기 관련 에너지 약 **20~40% 절감**

### 5.2 Economizer (이코노마이저)

| 설정 | 결과 영향 |
|:---|:---|
| **활성화** | 중간기 냉방 에너지 **감소** (외기 냉방) |
| **비활성화** | 연중 기계 냉방 의존 |

### 5.3 Fan Control

| 설정 | 결과 영향 |
|:---|:---|
| **Variable Volume (VAV)** | 송풍기 에너지 **감소** (부분 부하 시) |
| **Constant Volume (CAV)** | 송풍기 에너지 **증가** (항상 정풍량) |

---

## 6. 기타 설정 파라미터

### 6.1 Infiltration (침기)

| 설정 방향 | 결과 영향 |
|:---|:---|
| **침기량 증가** | 냉난방 부하 **증가** |
| **침기량 감소 (기밀 향상)** | 냉난방 부하 **감소** |

### 6.2 Lighting Power Density (LPD)

| 설정 방향 | 결과 영향 |
|:---|:---|
| **LPD 증가 (W/m²)** | 조명 에너지 **증가**, 냉방 부하 **증가** |
| **LPD 감소 (고효율 조명)** | 조명 에너지 **감소**, 냉방 부하 **감소** |

### 6.3 Equipment Power Density (EPD)

| 설정 방향 | 결과 영향 |
|:---|:---|
| **EPD 증가 (W/m²)** | 장비 에너지 **증가**, 냉방 부하 **증가** |
| **EPD 감소** | 장비 에너지 **감소**, 냉방 부하 **감소** |

---

## 7. 설정 불가 항목 (Autodesk 고정값)

다음 항목은 Revit/Insight 클라우드 해석에서 사용자 변경이 불가합니다:

| 항목 | 고정값 | 대안 |
|:---|:---|:---|
| **Simulation Timestep** | 15분 또는 1시간 | EnergyPlus 로컬 실행 |
| **Weather Data Source** | Autodesk 제공 EPW | gbXML 내보내기 후 수동 교체 |
| **Simulation Engine** | DOE-2.2 기반 | EnergyPlus 사용 |
| **Zone Equipment 타입 추가** | 드롭다운 목록 한정 | OpenStudio에서 커스텀 정의 |

---

## 8. 파라미터 영향도 요약 매트릭스

| 파라미터 | Heating | Cooling | Fans | Lighting | Equipment |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Occupancy ↑** | ↓ | ↑↑ | ↑ | - | - |
| **Lighting Schedule ↑** | ↓ | ↑ | - | ↑↑ | - |
| **Equipment Schedule ↑** | ↓ | ↑ | - | - | ↑↑ |
| **Cooling Setpoint ↑** | - | ↓↓ | ↓ | - | - |
| **Heating Setpoint ↑** | ↑↑ | - | ↑ | - | - |
| **Insulation ↑** | ↓↓ | ↓ | - | - | - |
| **SHGC ↓** | ↑ | ↓↓ | - | - | - |
| **Heat Exchanger (Enthalpy)** | ↓↓ | ↓ | - | - | - |
| **VAV Fan** | - | - | ↓↓ | - | - |

**범례:** ↑↑ 큰 증가, ↑ 증가, ↓ 감소, ↓↓ 큰 감소, - 영향 없음

---

## 9. 관련 문서

- 시뮬레이션 엔진 비교: `03_Revit_Energy_Simulation_Engine_Comparison.md`
- 데이터 가용성: `08_Revit_Energy_Data_Availability_Guide.md`
- Zone Equipment 가이드: `04_Revit_Zone_Equipment.md`
- Air System 설정: `06_Revit_Air_System_Settings.md`
