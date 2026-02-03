# 🏗️ Revit 구역 장비(Zone Equipment) 마스터 가이드

> <strong>Document Info</strong>
> * <strong>분류 (Category):</strong> Revit / HVAC / Energy Analysis
> * <strong>타겟 시스템 (Target System):</strong> Revit 에너지 모델, 구역(Zone) 시스템 선택
> * <strong>최종 업데이트 (Last Updated):</strong> 2026-02-03
> * <strong>핵심 키워드 (Keywords):</strong> `Zone Equipment`, `HVAC`, `Energy Model`, `Revit Properties`

---

<div align="center">

# 보이지 않는 조건을 정량화하는 장비 선택

### Revit 에너지 해석용 구역 장비 기준 정리

</div>

---

<br>

Revit 에너지 해석 시 선택 가능한 장비들의 정의, <strong>추천 상황</strong>, 그리고 <strong>속성창(Properties)</strong> 설정 방법을 정리했습니다.

---

## ✅ 공식 참고 문서 (Autodesk)

- **Revit 에너지 해석 장비 선택/속성 설정 공식 가이드**: 시뮬레이션에서 사용되는 장비 유형과 속성(Properties) 개념을 확인할 때 참고합니다.
- **HVAC 시스템 종류별 상세 설명**: 시뮬레이션용 HVAC 시스템 유형별 설명/설정 방법을 확인할 때 참고합니다.

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

## 2. 🎯 상황별 추천 요약 ("이럴 땐 이걸 쓰세요")

* 🚩 <strong>일반적인 대형 오피스 빌딩 설계를 할 때</strong>
    * 👉 <strong>[Variable Air Volume Box]</strong> (내주부) + <strong>[Parallel Fan Powered Box]</strong> (창가 쪽)
* 🚩 <strong>학교 교실이나 시스템 에어컨을 사용하는 건물을 설계할 때</strong>
    * 👉 <strong>[Variable Refrigerant Flow Fan Coil (VRF)]</strong>
* 🚩 <strong>호텔 객실처럼 옆방은 난방, 내 방은 냉방을 동시에 하고 싶을 때</strong>
    * 👉 <strong>[Four Pipe Fan Coil]</strong> (4관식이라 냉/온수 동시 공급 가능)
* 🚩 <strong>미국 스타일의 모텔이나 기숙사 창문 밑에 있는 에어컨을 표현할 때</strong>
    * 👉 <strong>[Packaged Terminal Air Conditioner (PTAC)]</strong>
* 🚩 <strong>천장이 높고 바닥 난방이 필요한 로비 공간</strong>
    * 👉 <strong>[Radiant Panel]</strong>

---

## 3. ℹ️ 장비별 상세 설명 및 설정 가이드

각 장비명을 클릭하면 <strong>추천 상황</strong>과 <strong>속성 설정법</strong>이 펼쳐집니다.

> **추가 참고:** HVAC 시스템 유형별 상세 설명은 Autodesk 공식 문서를 참고하세요.
> - https://help.autodesk.com/view/RVT/2026/KOR/?guid=HVAC_Systems

<details>
<summary><strong>💨 가변 풍량 박스 (Variable Air Volume Box)</strong></summary>

* <strong>🚩 추천 상황:</strong> <strong>일반적인 대형 오피스 빌딩 설계를 할 때 (내주부)</strong>
* <strong>설명:</strong> 중앙 공조기(AHU)에서 오는 바람의 양을 '댐퍼'로 조절하는 장비입니다.
* <strong>특징:</strong> 송풍 동력을 아낄 수 있어 대규모 빌딩의 표준 시스템입니다.

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

* <strong>🚩 추천 상황:</strong> <strong>일반적인 대형 오피스 빌딩 설계를 할 때 (창가 쪽/외주부)</strong>
* <strong>설명:</strong> VAV 박스에 소형 팬을 달아 난방 효율을 높인 장비입니다.
* <strong>특징:</strong> 외기 영향을 많이 받아 추운 창가 쪽에 따뜻한 천장 공기를 섞어 보내줍니다.

    <br>
    <details>
    <summary><strong>⚙️ [속성 설정 가이드] Fan Type, Coil</strong></summary>
    <br>

    <strong>1. Fan Type (팬 타입)</strong>
    * <strong>Parallel (병렬):</strong> 난방 시에만 팬 가동 (에너지 절약).
    * <strong>Series (직렬):</strong> 항상 팬 가동 (기류 일정).

    <strong>2. Heating Coil</strong>
    * 창가 쪽은 춥기 때문에 난방 코일 설정이 필수입니다.
    * `Hot Water`(온수) 또는 `Electric Resistance`(전기) 중 선택.
    </details>
</details>

<details>
<summary><strong>❄️ 가변형 냉매 순환 수(VRF)식 팬 코일 (VRF Fan Coil)</strong></summary>

* <strong>🚩 추천 상황:</strong> <strong>학교 교실이나 시스템 에어컨(EHP/GHP)을 사용하는 건물을 설계할 때</strong>
* <strong>설명:</strong> 실외기에서 냉매 유량을 가변적으로 제어하여 실내로 보냅니다.
* <strong>특징:</strong> 에너지 효율이 매우 높고 개별 제어가 탁월합니다.

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

* <strong>🚩 추천 상황:</strong> <strong>호텔 객실처럼 옆방은 난방, 내 방은 냉방을 동시에 하고 싶을 때</strong>
* <strong>설명:</strong> 냉수/온수 배관이 각각 따로 있어 언제든 냉난방 전환이 가능한 FCU입니다.
* <strong>특징:</strong> 계절이 바뀌는 환절기에 컴플레인 없이 쾌적한 제어가 가능합니다.

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

* <strong>🚩 추천 상황:</strong> <strong>미국 스타일의 모텔이나 기숙사 창문 밑에 있는 에어컨을 표현할 때</strong>
* <strong>설명:</strong> 벽을 뚫고 설치하는 일체형 냉난방기입니다. (실외기 없음)
* <strong>특징:</strong> 중앙 배관이 필요 없어 개보수가 쉽지만, 소음이 크고 투박합니다.

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

* <strong>🚩 추천 상황:</strong> <strong>천장이 높고 바닥 난방이 필요한 로비 공간</strong>
* <strong>설명:</strong> 바닥이나 천장 면을 데우거나 식히는 방식입니다.
* <strong>특징:</strong> 공기를 데우지 않고 복사열을 이용해 대공간 난방 효율이 좋습니다.

    <br>
    <details>
    <summary><strong>⚙️ [속성 설정 가이드] Surface, Loop</strong></summary>
    <br>

    <strong>1. Active Surface (활성 표면)</strong>
    * `Floor`: 바닥 난방/냉방 (가장 흔함).
    * `Ceiling`: 천장 복사 패널.

    <strong>2. Hot Water Loop</strong>
    * 바닥 엑셀 파이프에 흐를 온수 배관을 연결합니다.
    </details>
</details>

<details>
<summary><strong>🔇 칠드 빔 - 액티브 (Active Chilled Beam)</strong></summary>

* <strong>🚩 추천 상황:</strong> <strong>도서관, 임원실 등 소음이 적어야 하는 고급 오피스</strong>
* <strong>설명:</strong> 1차 공기(환기)를 노즐로 쏘아 실내 공기를 유인, 냉각하는 방식입니다.
* <strong>특징:</strong> 팬 소음이 거의 없고 불쾌한 바람이 없습니다.

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

* <strong>🚩 추천 상황:</strong> <strong>쇼핑몰, 주상복합 등 구역 간 열 재활용이 필요한 대형 공간</strong>
* <strong>설명:</strong> 물 배관을 열원(Source)으로 사용하는 히트펌프입니다.
* <strong>특징:</strong> 건물의 남는 열을 회수하여 다른 곳에 쓰는 등 에너지 효율이 높습니다.

    <br>
    <details>
    <summary><strong>⚙️ [속성 설정 가이드] Condenser Loop</strong></summary>
    <br>

    <strong>1. Condenser Water Loop (필수)</strong>
    * 건물 전체를 순환하는 '수열원 루프(WLHP Loop)'를 반드시 지정해야 합니다.
    </details>
</details>
