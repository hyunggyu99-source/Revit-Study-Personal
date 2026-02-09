# 08. Revit Energy Data Availability Guide

Revit 에너지 해석에서 얻을 수 있는 데이터의 종류와 세부 수준(월별/연간)을 정리한 가이드입니다.

---

## 1. 시뮬레이션 계산 정밀도 (Simulation Timestep)

### 1.1 데이터 기반 분석 결과

본 프로젝트의 에너지 해석 리포트에서 다음 파라미터가 확인되었습니다:

| 파라미터 | 값 | 의미 |
|:---|---:|:---|
| **Hours Simulated** | 8,760.00 hrs | 연간 총 시뮬레이션 시간 (365일 × 24시간) |
| **Number of Timesteps per Hour** | 4 | 시간당 계산 횟수 |
| **Timestep Interval** | 15분 | 단위 계산 간격 (60분 ÷ 4) |
| **Total Data Points** | 35,040개 | 연간 총 계산 포인트 (8,760 × 4) |

### 1.2 Timestep 설정 가변성

| 플랫폼 | 사용자 설정 가능 여부 | 기본값 | 비고 |
|:---|:---:|:---:|:---|
| **Revit/Insight (Cloud)** | ❌ 불가 | 15분 또는 1시간 | Autodesk 서버 고정 설정 |
| **EnergyPlus (Local)** | ✅ 가능 | 사용자 정의 | 1~60분 범위 설정 가능 |
| **OpenStudio** | ✅ 가능 | 사용자 정의 | GUI에서 조정 가능 |

### 1.3 Timestep이 결과에 미치는 영향

Timestep 간격이 짧을수록(예: 15분 → 5분) 다음 항목의 정밀도가 향상됩니다:

- **피크 부하(Peak Load)** 산정 정확도
- **급격한 부하 변동** 포착 (일사량 변화, 재실 패턴 등)
- **제어 시스템 응답** 시뮬레이션

단, 계산 시간이 비례하여 증가하므로, 일반적인 건물 에너지 해석에서는 15분~1시간 간격이 표준으로 적용됩니다.

---

## 2. 월별 데이터 가용성 요약

| 데이터 유형 | 월별 가능 | 연간만 가능 | 비고 |
|:---|:---:|:---:|:---|
| **용도별 에너지 소비** | ✅ 가능 | ✅ 가능 | Heating, Cooling, Fans 등 |
| **에너지원별 소비** | ❌ **불가** | ✅ 가능 | Electricity, Natural Gas 등 |
| **EUI (에너지 원단위)** | ❌ 불가 | ✅ 가능 | kBtu/ft² 또는 kWh/m² |
| **피크 시간/값** | ❌ 불가 | ✅ 가능 | 연중 피크 시점만 |

> **핵심:** 에너지원별(Electricity, Natural Gas, District Cooling/Heating) 소비는 **연간 총합만** 가능하고, **월별로는 제공되지 않습니다.**

---

## 3. 월별로 알 수 있는 데이터 전체 목록

### ✅ 활성 데이터 (현재 모델에 값 있음)

| 카테고리 | 항목 | 1월 예시값 | 연간 합계 |
|:---|:---|---:|---:|
| **냉방 (Cooling)** | 전기 소비 | 1.29 kWh | 1,854.75 kWh |
| **난방 (Heating)** | 가스 소비 | 19.65 therms | 88.93 therms |
| **실내 조명 (Interior Lighting)** | 전기 소비 | 16.39 kWh | 193.03 kWh |
| **실내 장비 (Interior Equipment)** | 전기 소비 | 7.80 kWh | 91.86 kWh |
| **송풍기 (Fans)** | 전기 소비 | 145.30 kWh | 2,431.81 kWh |
| **펌프 (Pumps)** | 전기 소비 | 15.06 kWh | 93.66 kWh |
| **월 합계 (Total)** | 전기 총합 | 185.84 kWh | - |

### ⚪ 비활성 데이터 (모델에 해당 설비 없음 → 값 0 또는 빈칸)

| 항목 | 상태 | 의미 |
|:---|:---:|:---|
| **Exterior Lighting (외부 조명)** | 비활성 | 외부 조명 설비 미설정 |
| **Exterior Equipment (외부 장비)** | 비활성 | 외부 장비 미설정 |
| **Heat Rejection (열배출)** | 비활성 | 냉각탑 등 미설정 |
| **Humidification (가습)** | 비활성 | 가습기 미설정 |
| **Heat Recovery (열회수)** | 비활성 | 열회수 장치 미설정 또는 별도 계산 |
| **Water Systems (급탕/급수)** | 비활성 | 급탕 시스템 미설정 |
| **Refrigeration (냉장)** | 비활성 | 냉장 설비 미설정 |
| **Generators (발전기)** | 비활성 | 발전기 미설정 |

---

## 4. 경고/품질 데이터 (Warnings & Quality Indicators)

### 설정온도 미충족 시간 (Unmet Hours)

| 항목 | 값 | 해석 |
|:---|---:|:---|
| **난방 설정온도 미충족 시간** | 2,109.50 Hours | ⚠️ **경고!** 난방 용량 부족 |
| **냉방 설정온도 미충족 시간** | 29.25 Hours | ✅ 양호 (ASHRAE 기준 300시간 이하) |
| **ASHRAE 55 쾌적 기준 미충족** | 5,065.50 Hours | ⚠️ 쾌적 범위 벗어난 시간 |

### 존별 상세 Unmet Hours (일부 예시)

| 존(Zone) | 냉방 미충족 | 난방 미충족 |
|:---|---:|---:|
| 1 STAIRWELL | 0.02 °F·hr | 0.01 °F·hr |
| 2 ELEVATOR SHAFT | 0.34 °F·hr | 1.21 °F·hr |
| 6F_OPENWORKSPACE_VAV-1 | 52.96 °F·hr | **24,934.12 °F·hr** ⚠️ |

> **해석:** `6F_OPENWORKSPACE_VAV-1` 존의 난방 미충족이 매우 높음 → 난방 코일 용량 또는 열교환기 설정 재검토 필요

---

## 5. 연간 전용 데이터 (월별 불가)

### 에너지원별 소비 (Annual Only)

| 에너지원 | 연간 소비량 | SI 변환 |
|:---|---:|---:|
| **전기 (Electricity)** | 15,914 kBtu | 4,664 kWh |
| **도시가스 (Natural Gas)** | 88,934 kBtu | 26,064 kWh |
| **지역냉방 (District Cooling)** | 6,644 kBtu | 1,947 kWh |
| **지역난방 (District Heating)** | 20,226 kBtu | 5,928 kWh |

### EUI (에너지 원단위)

| 항목 | 값 (IP) | 값 (SI) |
|:---|---:|---:|
| **Total Electricity Intensity** | 219.59 kBtu/ft² | 692.72 kWh/m² |
| **HVAC Electricity Intensity** | 206.18 kBtu/ft² | 650.41 kWh/m² |
| **Lighting Electricity Intensity** | 9.09 kBtu/ft² | 28.68 kWh/m² |

### 피크 시간 (Peak Time)

| 에너지원 | 피크 시점 |
|:---|:---|
| **전기 피크** | 8월 11일 14:30 |
| **가스 피크** | 12월 19일 10:00 |

---

## 6. 전체 데이터 구조 요약

```
┌─────────────────────────────────────────────────────────────────┐
│                  Revit 에너지 해석 데이터 구조                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── 월별 (Monthly) ───┐    ┌─── 연간 (Annual Only) ───┐      │
│  │                      │    │                          │      │
│  │  ✅ 용도별 소비       │    │  ✅ 에너지원별 소비       │      │
│  │  - Heating           │    │  - Electricity           │      │
│  │  - Cooling           │    │  - Natural Gas           │      │
│  │  - Fans              │    │  - District Cooling      │      │
│  │  - Pumps             │    │  - District Heating      │      │
│  │  - Lighting          │    │                          │      │
│  │  - Equipment         │    │  ✅ EUI (원단위)          │      │
│  │                      │    │  ✅ 피크 시간/값          │      │
│  └──────────────────────┘    └──────────────────────────┘      │
│                                                                 │
│  ┌─── 경고/품질 데이터 (Annual) ───┐                            │
│  │                                 │                            │
│  │  ⚠️ Unmet Hours (설정온도 미충족)│                            │
│  │  ⚠️ ASHRAE 55 쾌적 미충족        │                            │
│  │  ⚠️ 존별 상세 미충족 시간         │                            │
│  │  📋 Measure Warnings 개수        │                            │
│  │                                 │                            │
│  └─────────────────────────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. 핵심 정리

| 질문 | 답변 |
|:---|:---|
| 에너지원별 월별 데이터 가능? | ❌ **불가** (연간만 제공) |
| 용도별 월별 데이터 가능? | ✅ 가능 (12개월 × 6개 용도) |
| 누락된 설비 데이터 확인 가능? | ✅ 가능 (비활성 항목으로 표시) |
| 설정온도 미충족 경고 확인? | ✅ 가능 (Unmet Hours) |
| 쾌적도 경고 확인? | ✅ 가능 (ASHRAE 55 기준) |

---

## 8. 관련 문서

- 원본 데이터: `01_Revit_Energy_Raw_Data.md`
- 데이터 요약: `02_Revit_Air_System_Settings_Summary.md`
- 시뮬레이션 엔진 비교: `03_Revit_Energy_Simulation_Engine_Comparison.md`
- 사용자 설정 파라미터: `09_Revit_Energy_User_Customization_Parameters.md`
