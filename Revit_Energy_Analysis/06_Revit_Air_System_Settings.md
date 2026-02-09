# 06. Revit Air System (AHU) 설정 가이드

Revit 에너지 해석의 정확도를 결정짓는 핵심 요소인 **공조기(Air System/AHU)**의 상세 설정 가이드입니다.

본 문서는 **한국형 오피스 빌딩(사계절 뚜렷, 습한 여름/건조한 겨울)**에 최적화된 **VAV(가변 풍량)** 시스템 설정을 기준으로 작성되었습니다. 각 파라미터가 에너지 해석 결과에 미치는 영향과 실무 권장값을 정리합니다.

---

## 설정 화면

<img src="../images/Revit_AHU_Properties_Setting_01.png" width="100%">

<img src="../images/Revit_AHU_Properties_Setting_02.png" width="100%">

## 1. 설정 항목 상세 분석 (Settings Breakdown)

| 설정 항목 (Item) | 권장 설정값 (Value) | 의미 및 설명 | 실무 활용 팁 |
| :--- | :--- | :--- | :--- |
| <strong>Heat Exchanger</strong><br>(열교환기) | `Enthalpy`<br>(전열교환) | <strong>폐열 회수 장치 (ERV)</strong><br>실내의 냉/난방 에너지를 밖으로 버리지 않고, 들어오는 외기에 전달합니다. | <strong>[필수]</strong> 한국 녹색건축 인증 필수 요소입니다.<br>설정 안 할 경우 난방비가 30% 이상 과다 산정됩니다. |
| <strong>Preheat Coil</strong><br>(예열 코일) | `<None>`<br>(없음) | <strong>동파 방지용 보조 코일</strong><br>혹한기에 메인 코일이 얼지 않도록 외기를 1차로 데워주는 장치입니다. | 해석 단계에서는 <strong>OFF</strong>를 권장합니다.<br>켜면 제어 로직이 복잡해져 시뮬레이션 오류가 날 수 있습니다. |
| <strong>Cooling Coil</strong><br>(냉방 코일) | `Chilled Water`<br>(냉수) | <strong>중앙 냉방 공급원</strong><br>냉동기(Chiller)에서 만든 찬물을 이용해 공기를 식힙니다. | `<None>`으로 두면 '송풍(Ventilation)'만 하는 선풍기가 됩니다.<br>반드시 Water Loop와 연결 확인이 필요합니다. |
| <strong>Heating Coil</strong><br>(난방 코일) | `Hot Water`<br>(온수) | <strong>중앙 난방 공급원</strong><br>보일러(Boiler)에서 만든 뜨거운 물을 이용해 공기를 데웁니다. | 시스템 리포트(AHU 부하)에 난방값이 `0`으로 나온다면 이 항목이 꺼져 있는지 확인해야 합니다. |
| <strong>Fan</strong><br>(송풍기) | `Variable Volume`<br>(가변 풍량) | <strong>풍량 제어 방식</strong><br>실내 부하량에 따라 모터 회전수를 조절하여 에너지를 절약합니다. | 최신 오피스는 대부분 VAV 시스템을 채택하므로 기본값을 유지합니다. |

<br>

### 1-1. 핵심 항목 설명 (실무형 요약)

1. **Heat Exchanger (전열교환기) — 필수 설정**
   - 현재 설정: `<None>` (없음)
   - 권장 설정: `Enthalpy` (엔탈피 - 전열교환)
   - 근거:
     - 법적 기준: 대한민국 녹색건축 인증 기준상, 일정 규모 이상의 건물은 전열교환기(ERV) 설치가 사실상 의무 사항
     - 기술적 근거: 겨울철 배기 시 실내 공기의 열에너지를 외기에 전달하는 장치로, 미설치 시 난방 에너지가 30% 이상 과다 산정
   - 선택지:
     - `Sensible` (현열): 온도만 교환 (건조한 기후 적합)
     - `Enthalpy` (전열): 온도+습도 교환 (한국 기후 표준)

2. **Preheat Coil (예열 코일) — 선택 사항**
   - 현재 설정: `<None>` (없음)
   - 권장 설정: `<None>` (유지)
   - 근거:
     - 기능: 혹한기에 외기 온도가 극저온일 때 메인 코일의 동파를 방지하기 위한 1차 예열 장치
     - 시뮬레이션 시 **메인 Heating Coil**이 난방을 전담하도록 설정하는 것이 계산 안정성 확보에 유리
   - 참고: 시뮬레이션 중 "코일 동파 위험" 경고 발생 시 `Electric` 또는 `Hot Water`로 변경 가능

## 2. 변수 조절에 따른 변화 (What If?)

설정값을 잘못 지정했을 때 에너지 해석 결과가 어떻게 왜곡되는지 이해해야 합니다.

* **Heat Exchanger = `<None>` 설정 시:**
    * 겨울철 환기 시 외기가 무처리 상태로 유입되어 난방 부하가 과대 산정됨. 건물이 에너지 과소비형으로 평가될 위험
* **Heat Exchanger = `Sensible`(현열) 설정 시:**
    * 온도 교환만 수행하고 습도 교환이 불가. 여름철 고온다습한 한국 기후에서는 잠열 부하 처리가 불충분하여 냉방 에너지가 과다 산정 (`Enthalpy` 권장)
* **Preheat Coil 활성화 시:**
    * 실제 시공에서는 필요하나, Revit 시뮬레이션에서는 메인 Heating Coil과 역할이 중복되어 해석 시간 증가 또는 경고(Warning) 발생 가능

<br>

## 3. 데이터 활용 및 기대 효과 (Utilization)

이 설정을 통해 산출된 <strong>시스템 부하 보고서(System Load Summary)</strong>는 다음과 같이 활용됩니다.

### 🏭 장비 용량 산정 (Sizing)
* <strong>냉동기/보일러 스펙 결정:</strong> 보고서에 나온 `Total Coil Load` 값을 근거로 기계실에 들어갈 메인 장비의 용량(USRT, kcal/h)을 결정합니다.
* <strong>오버 스펙 방지:</strong> 과도하게 큰 장비를 사지 않도록 최적화된 용량을 제안하여 건축비를 절감합니다.

### 🌿 친환경 성능 평가
* <strong>에너지 절감률 입증:</strong> 전열교환기(`Enthalpy`) 적용 전/후의 부하량을 비교하여, 해당 설비 도입으로 인한 에너지 절감 효과를 수치로 증명합니다.

### 🏢 디지털 트윈 구축 (Tandem)
* <strong>자산 데이터 매핑:</strong> 텐덤 상에서 해당 AHU 자산(Asset)을 클릭했을 때, 실제 설계 스펙(VAV, Hot Water Coil 등)이 정확하게 표시되도록 합니다.

---

> **참고:** 본 설정은 **대한민국 기후(Climate Zone 4A)**에 위치한 대형 오피스 빌딩의 표준값입니다. 설정 완료 후 `[Analyze] → [System Analysis]`를 실행하여 Heating Load 값이 정상적으로 산출되는지 검증하시기 바랍니다.