# 04. Revit Zone Equipment 설정 가이드

> **Document Info**
> * **분류 (Category):** Revit / HVAC / Energy Analysis
> * **타겟 시스템 (Target System):** Revit 에너지 모델, 구역(Zone) 시스템 선택
> * **최종 업데이트 (Last Updated):** 2026-02-03
> * **핵심 키워드 (Keywords):** `Zone Equipment`, `HVAC`, `Energy Model`, `Revit Properties`

---

본 문서는 Revit 에너지 해석에서 선택 가능한 Zone Equipment의 정의, **적용 시나리오**, 그리고 **속성(Properties) 설정 방법**을 체계적으로 정리한 기술 문서입니다.

---

## ✅ 공식 참고 문서 (Autodesk)

- **Revit 에너지 해석 장비 선택/속성 설정 공식 가이드**: 시뮬레이션에서 사용되는 장비 유형과 속성(Properties) 개념 참조
- **HVAC 시스템 종류별 상세 설명**: 시뮬레이션용 HVAC 시스템 유형별 설명 및 설정 방법 참조

> 링크:
> - https://help.autodesk.com/view/RVT/2026/KOR/?guid=Simulation
> - https://help.autodesk.com/view/RVT/2026/KOR/?guid=HVAC_Systems

## 1. 📊 한눈에 보는 장비 비교

| 장비 유형 (한글/영문) | 핵심 키워드 | 추천 용도 (Best For) |
| :--- | :--- | :--- |
| <strong>가변 풍량 박스 (VAV)</strong> | #에너지절약 #표준 | 대형 오피스, 회의실 |
| <strong>팬 파워드 박스 (Fan Powered)</strong> | #난방강화 #창가쪽 | 오피스 외주부(창가) |
| <strong>VRF 팬 코일</strong> | #고효율 #개별제어 | 학교, 중소형 오피스 |
| <strong>4관식 팬 코일 (FCU)</strong> | #호텔 #냉난방자유 | 호텔, 기숙사 |
| <strong>칠드 빔 (Chilled Beam)</strong> | #무소음 #쾌적 | 도서관, 임원실 |
| <strong>수열원 히트펌프 (WSHP)</strong> | #열재활용 #쇼핑몰 | 복합 쇼핑몰, 대형 건물 |
| <strong>패키지형 터미널 (PTAC)</strong> | #일체형 #벽부형 | 모텔, 구형 건물 |
| <strong>복사 패널 (Radiant)</strong> | #바닥난방 #대공간 | 로비, 아트리움 |

---

## 2. 시나리오별 장비 선정 가이드

| 건물 유형 / 적용 조건 | 권장 장비 |
|:---|:---|
| **대형 오피스 빌딩 (내주부)** | Variable Air Volume Box |
| **대형 오피스 빌딩 (외주부/창가)** | Parallel Fan Powered Box |
| **학교, 중소형 빌딩 (개별 제어)** | Variable Refrigerant Flow Fan Coil (VRF) |
| **호텔, 기숙사 (냉난방 동시 운전)** | Four Pipe Fan Coil (4관식 FCU) |
| **소규모 숙박, 기존 건물 (벽부형)** | Packaged Terminal Air Conditioner (PTAC) |
| **로비, 아트리움 (대공간 복사 난방)** | Radiant Panel |
| **도서관, 고급 오피스 (저소음)** | Active Chilled Beam |
| **복합 상업시설 (열 재활용)** | Water Source Heat Pump (WSHP) |

---

## 3. ℹ️ 장비별 상세 설명 및 설정 가이드

각 장비명을 클릭하면 **적용 시나리오**와 **속성 설정 방법**이 표시됩니다.

> **참고:** HVAC 시스템 유형별 상세 설명은 [Autodesk 공식 문서](https://help.autodesk.com/view/RVT/2026/KOR/?guid=HVAC_Systems)를 참조하시기 바랍니다.

<details>
<summary><strong>💨 가변 풍량 박스 (Variable Air Volume Box)</strong></summary>

* **적용 시나리오:** 대형 오피스 빌딩 내주부 (표준 공조 시스템)
* **설명:** 중앙 공조기(AHU)에서 공급되는 풍량을 댐퍼로 제어하는 말단 장비
* **특징:** 부분 부하 시 송풍 동력 절감이 가능하며, 대규모 빌딩의 표준 시스템으로 채택

    <br>
    <details>
    <summary><strong>⚙️ [속성 설정 가이드] Behavior, Heating Coil</strong></summary>
    <br>

    <strong>1. Behavior (동작 방식)</strong>
    * `One per Space`: 방마다 1대씩 설치 (개별 제어).
    * `Groups Spaces`: 여러 방을 1대로 묶어서 제어 (개방형 공간).

    <strong>2. Heating Coil (난방 코일)</strong>
    * VAV 박스에 달린 재가열 코일 종류입니다.
    * `Electric Resistance`: 전기 히터 (설치 간편, 운영비 높음).
    * `Hot Water`: 온수 코일 (보일러 연결, 효율 좋음).

    <strong>3. Air System</strong>
    * 연결될 부모 장비(AHU)를 지정합니다.
    </details>
</details>

<details>
<summary><strong>🚀 팬 파워드 박스 - 직렬/병렬 (Fan Powered Box)</strong></summary>

* **적용 시나리오:** 대형 오피스 빌딩 외주부 (창가 측, 난방 부하 집중 구간)
* **설명:** VAV 박스에 소형 팬을 추가하여 난방 성능을 보강한 장비
* **특징:** 외기 영향이 큰 외주부에서 천장 공간의 따뜻한 공기를 혼합하여 급기

    <br>
    <details>
    <summary><strong>⚙️ [속성 설정 가이드] Fan Type, Coil</strong></summary>
    <br>

    <strong>1. Fan Type (팬 타입)</strong>
    * <strong>Parallel (병렬):</strong> 난방 시에만 팬 가동 (에너지 절약).
    * <strong>Series (직렬):</strong> 항상 팬 가동 (기류 일정).

    <strong>2. Heating Coil</strong>
    * 외주부 난방 보강을 위해 난방 코일 설정이 필수
    * `Hot Water`(온수) 또는 `Electric Resistance`(전기) 중 선택
    </details>
</details>

<details>
<summary><strong>❄️ 가변형 냉매 순환 수(VRF)식 팬 코일 (VRF Fan Coil)</strong></summary>

* **적용 시나리오:** 학교, 중소형 오피스 등 개별 제어가 필요한 건물 (EHP/GHP 시스템)
* **설명:** 실외기에서 냉매 유량을 가변적으로 제어하여 실내기로 공급
* **특징:** 높은 에너지 효율과 실별 개별 제어 가능

    <br>
    <details>
    <summary><strong>⚙️ [속성 설정 가이드] Loop, Ventilation</strong></summary>
    <br>

    <strong>1. Condenser Water Loop (냉각수 루프)</strong>
    * `None`: 일반적인 공랭식(Air-Cooled) 실외기를 쓸 때 선택합니다.
    * `Loop 선택`: 수랭식(Water-Cooled) VRF를 쓸 경우, 연결할 냉각수 배관을 지정합니다.

    <strong>2. Air System (환기)</strong>
    * VRF는 냉난방 전용이므로 환기 장치(DOAS)가 따로 있다면 여기서 연결합니다.

    <strong>3. Behavior</strong>
    * 주로 `One per Space` (실별 제어)를 사용합니다.
    </details>
</details>

<details>
<summary><strong>🏨 4관식 팬 코일 (Four Pipe Fan Coil)</strong></summary>

* **적용 시나리오:** 호텔, 기숙사 등 실별 냉난방 동시 운전이 필요한 건물
* **설명:** 냉수/온수 배관이 독립적으로 구성되어 실별 냉난방 전환이 자유로운 FCU
* **특징:** 환절기에도 인접 실간 냉난방 동시 운전이 가능하여 쾌적성 확보

    <br>
    <details>
    <summary><strong>⚙️ [속성 설정 가이드] Chilled/Hot Water Loop</strong></summary>
    <br>

    <strong>1. Chilled Water Loop (냉수 루프)</strong>
    * 냉동기(Chiller)와 연결된 배관을 지정합니다.

    <strong>2. Hot Water Loop (온수 루프)</strong>
    * 보일러(Boiler)와 연결된 배관을 지정합니다.

    <strong>3. Air System</strong>
    * 별도의 외기 도입 시스템(DOAS)이 있다면 여기서 연결합니다.
    </details>
</details>

<details>
<summary><strong>📦 패키지형 터미널 에어컨 (PTAC)</strong></summary>

* **적용 시나리오:** 소규모 숙박시설, 기존 건물 등 벽부형 일체형 장비 적용 시
* **설명:** 외벽 관통 설치 방식의 일체형 냉난방기 (실외기 불필요)
* **특징:** 중앙 배관 불필요로 개보수 용이하나, 소음 및 미관 측면에서 제약 존재

    <br>
    <details>
    <summary><strong>⚙️ [속성 설정 가이드] Cooling/Heating Source</strong></summary>
    <br>

    <strong>1. Cooling Source (냉방원)</strong>
    * `DX (Direct Expansion)`: 일반 에어컨처럼 냉매 직팽식을 주로 사용합니다.

    <strong>2. Heating Source (난방원)</strong>
    * `Hot Water`: 중앙 보일러 온수를 끌어다 쓰는 경우.
    * `Electric`: 전기 히터를 쓰는 경우.
    * `Heat Pump`: 난방도 히트펌프(PTHP)로 하는 경우.
    </details>
</details>

<details>
<summary><strong>♨️ 복사 패널 (Radiant Panel)</strong></summary>

* **적용 시나리오:** 로비, 아트리움 등 천고가 높은 대공간의 바닥 난방
* **설명:** 바닥 또는 천장 표면을 통한 복사 방식 냉난방
* **특징:** 대류 방식 대비 대공간에서의 난방 효율이 우수하며, 기류 발생 최소화

    <br>
    <details>
    <summary><strong>⚙️ [속성 설정 가이드] Surface, Loop</strong></summary>
    <br>

    <strong>1. Active Surface (활성 표면)</strong>
    * `Floor`: 바닥 난방/냉방 (가장 흔함).
    * `Ceiling`: 천장 복사 패널.

    <strong>2. Hot Water Loop</strong>
    * 바닥 배관(Xcel Pipe 등)에 연결할 온수 루프를 지정합니다.
    </details>
</details>

<details>
<summary><strong>🔇 칠드 빔 - 액티브 (Active Chilled Beam)</strong></summary>

* **적용 시나리오:** 도서관, 임원 공간 등 저소음이 요구되는 고급 오피스
* **설명:** 1차 공기(환기)를 노즐로 분사하여 실내 공기를 유인(Induction)하고 냉각하는 방식
* **특징:** 팬 소음이 극히 낮으며, 불쾌 기류 발생 최소화

    <br>
    <details>
    <summary><strong>⚙️ [속성 설정 가이드] Air System, Coil</strong></summary>
    <br>

    <strong>1. Air System (필수)</strong>
    * 액티브 칠드 빔은 '바람'을 불어주는 장치(DOAS/AHU) 연결이 필수입니다.

    <strong>2. Chilled Water Loop</strong>
    * 천장의 빔을 차갑게 식혀줄 냉수 배관을 연결합니다.
    </details>
</details>

<details>
<summary><strong>🔄 수열원 히트펌프 (Water Source Heat Pump)</strong></summary>

* **적용 시나리오:** 복합 상업시설, 주상복합 등 구역 간 열 재활용이 필요한 대형 건물
* **설명:** 수열원 루프(Water Loop)를 열원으로 활용하는 히트펌프 시스템
* **특징:** 건물 내 잉여 열을 회수하여 타 구역에 재활용하므로 에너지 효율이 우수

    <br>
    <details>
    <summary><strong>⚙️ [속성 설정 가이드] Condenser Loop</strong></summary>
    <br>

    <strong>1. Condenser Water Loop (필수)</strong>
    * 건물 전체를 순환하는 '수열원 루프(WLHP Loop)'를 반드시 지정해야 합니다.
    </details>
</details>
