# 12. 📊 Revit Energy Analysis Data Inventory Summary

이 문서는 `00_Revit_Energy_Raw_Data.md`의 방대한 항목을 **빠르게 파악하기 위한 요약본**입니다.

---

## 1) 문서 목적

- Revit 에너지 해석 결과에서 추출되는 **연간/월간 지표**의 의미를 빠르게 이해
- **IP → SI 단위** 변환 해석을 지원
- **LEED / G-SEED** 인증 활용 포인트를 한눈에 정리

---

## 2) 컬럼 읽는 법

- **대분류**: 결과가 속한 리포트 섹션
- **항목명 (Eng/Kor)**: 리포트에서 실제 표시되는 항목명
- **현재값 (IP)**: 미국식 단위 결과값
- **변환값 (SI 예측)**: 국내 보고서용 참고값
- **데이터 의미**: 해당 값이 의미하는 지표
- **LEED/G-SEED 활용**: 인증 평가에 쓰이는 범위

---

## 3) 핵심 섹션 요약

### ✅ Annual Overview / 연간 개요

- 연간 에너지 소비를 **유형별(난방/냉방/조명/팬/펌프 등)**로 집계
- 연간 총량 기준의 **에너지 성능 비교**에 사용
- LEED: EAp2, EAc1 주요 근거
- G-SEED: EPI 및 단위면적당 1차에너지 산정에 활용
- 예시 데이터:
  - Heating - Consumption (kBtu) / 난방 - 소비: 109,160 kBtu (SI 예측: 31,992 kWh)
  - Cooling - Consumption (kBtu) / 냉방 - 소비: 12,976 kBtu (SI 예측: 3,803 kWh)

<details>
<summary><strong>📊 연간 에너지 소비 유형별 전체 데이터 (Annual Consumption by Type)</strong></summary>
<br>

**⚡ 용도별 에너지 소비 (End-Use Breakdown)**

| 용도 (End-Use) | 현재값 (IP) | SI 변환값 | 비율 |
|:---|---:|---:|---:|
| **Heating (난방)** | 109,160 kBtu | 31,992 kWh | **83.0%** |
| **Cooling (냉방)** | 12,976 kBtu | 3,803 kWh | 9.9% |
| **Fans (송풍기)** | 8,293 kBtu | 2,430 kWh | 6.3% |
| **Interior Lighting (실내 조명)** | 654 kBtu | 192 kWh | 0.5% |
| **Pumps (펌프)** | 322 kBtu | 94 kWh | 0.2% |
| **Interior Equipment (실내 장비)** | 313 kBtu | 92 kWh | 0.2% |
| **합계** | **131,718 kBtu** | **38,603 kWh** | 100% |

<br>

**🔌 에너지원별 소비 (Energy Source Breakdown)**

| 에너지원 (Source) | 현재값 (IP) | SI 변환값 |
|:---|---:|---:|
| **Natural Gas (도시가스)** | 88,934 kBtu | 26,064 kWh |
| **District Heating (지역난방)** | 20,226 kBtu | 5,928 kWh |
| **Electricity (전기)** | 15,914 kBtu | 4,664 kWh |
| **District Cooling (지역냉방)** | 6,644 kBtu | 1,947 kWh |

<br>

> **💡 해석 포인트:** 난방 에너지가 전체의 **83%**를 차지하며, 이는 건물 단열 성능 또는 열교환기(ERV) 설정 검토가 필요함을 시사합니다.

</details>

### ✅ Monthly Overview / 월간 개요

- 월별 부하/소비 변화를 확인
- **냉난방 성능의 계절별 패턴** 분석에 적합
- 부하 저감 성능, 피크 추이 분석에 활용
- 예시 데이터:
  - Cooling - Jul / 냉방 - Jul: 448.3 (SI 예측: 448.3 kWh)
  - Fans - Aug / 송풍기 - Aug: 390.26 (SI 예측: 390.26 kWh)

<details>
<summary><strong>📅 월별 용도별 에너지 소비 전체 데이터 (Monthly End-Use Breakdown)</strong></summary>
<br>

| 월 | Heating (난방) | Cooling (냉방) | Fans (송풍기) | Lighting (조명) | Pumps (펌프) | Equipment (장비) | **월 합계** |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| **Jan** | 19.65 therms | 1.29 kWh | 145.30 kWh | 16.39 kWh | 15.06 kWh | 7.80 kWh | 185.84 kWh |
| **Feb** | 14.57 therms | 3.94 kWh | 119.87 kWh | 14.81 kWh | 10.01 kWh | 7.05 kWh | 155.67 kWh |
| **Mar** | 12.21 therms | 6.34 kWh | 125.49 kWh | 16.39 kWh | 7.48 kWh | 7.80 kWh | 163.49 kWh |
| **Apr** | 4.83 therms | 50.09 kWh | 135.33 kWh | 15.87 kWh | 2.64 kWh | 7.55 kWh | 211.48 kWh |
| **May** | 1.94 therms | 157.58 kWh | 214.96 kWh | 16.39 kWh | 3.70 kWh | 7.80 kWh | 400.45 kWh |
| **Jun** | 0.15 therms | 350.17 kWh | 330.30 kWh | 15.87 kWh | 6.82 kWh | 7.55 kWh | 710.71 kWh |
| **Jul** | 0.02 therms | 448.30 kWh | 349.46 kWh | 16.39 kWh | 8.51 kWh | 7.80 kWh | 830.46 kWh |
| **Aug** | 0.04 therms | 517.50 kWh | 390.26 kWh | 16.39 kWh | 10.30 kWh | 7.80 kWh | **942.26 kWh** |
| **Sep** | 0.73 therms | 229.13 kWh | 225.76 kWh | 15.87 kWh | 4.43 kWh | 7.55 kWh | 482.74 kWh |
| **Oct** | 3.82 therms | 77.38 kWh | 128.25 kWh | 16.39 kWh | 2.92 kWh | 7.80 kWh | 232.74 kWh |
| **Nov** | 11.15 therms | 11.53 kWh | 120.30 kWh | 15.87 kWh | 6.53 kWh | 7.55 kWh | 161.78 kWh |
| **Dec** | 19.83 therms | 1.50 kWh | 146.53 kWh | 16.39 kWh | 15.25 kWh | 7.80 kWh | 187.47 kWh |
| **연간 합계** | **88.93 therms** | **1,854.75 kWh** | **2,431.81 kWh** | **193.03 kWh** | **93.66 kWh** | **91.86 kWh** | - |

<br>

**🔍 계절별 패턴 분석**

| 구분 | 피크 월 | 피크 소비량 | 패턴 특징 |
|:---|:---:|---:|:---|
| **난방 (Heating)** | 12월 | 19.83 therms | 겨울철(12~2월) 집중, 여름철 거의 0 |
| **냉방 (Cooling)** | 8월 | 517.50 kWh | 여름철(6~8월) 집중, 8월 최대 |
| **송풍기 (Fans)** | 8월 | 390.26 kWh | 냉방 시즌 연동, 냉방과 동반 증가 |
| **조명 (Lighting)** | - | ~16.4 kWh | 연중 일정 (베이스 로드) |
| **펌프 (Pumps)** | 12월 | 15.25 kWh | 난방/냉방 시즌에 증가 |
| **장비 (Equipment)** | - | ~7.8 kWh | 연중 일정 (베이스 로드) |

<br>

> **💡 해석 포인트:** 8월이 연간 에너지 소비 **최대 피크**(942.26 kWh)이며, 냉방+송풍기가 전체의 96%를 차지합니다.

</details>

### ✅ Detailed Report / 상세 리포트

- 시스템/장비 단위의 세부 항목 제공
- 설비 용량 산정, 운영 전략 검토에 유용
- 예시 데이터:
  - Total Site Energy - Total Energy [kBtu]: 131,804.73 kBtu (SI 예측: 38,628 kWh)
  - Total Source Energy - Total Energy [kBtu]: 227,055.89 kBtu (SI 예측: 66,543 kWh)

### ✅ Measure Warnings / 경고 항목

- 입력값 누락, 비현실적 설정 등 **주의 항목** 확인
- 리포트 해석 전 **우선 점검 리스트**로 활용
- 예시 데이터:
  - (예) Unmet Hours 경고
  - (예) 시스템 스케줄 미설정

---

## 4) 실무 활용 체크리스트

- **연간 개요**로 전체 에너지 성능을 빠르게 비교
- **월간 개요**로 계절별 과부하 원인 파악
- **Detailed Report**로 설비 용량 및 운전 전략 점검
- **Measure Warnings**에서 모델 품질 이슈를 선제 조치

---

원본 데이터 전체는 `00_Revit_Energy_Raw_Data.md`에서 확인하세요.
