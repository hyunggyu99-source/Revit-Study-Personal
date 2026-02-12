# Revit-Study-Personal

Revit의 **에너지 해석** 탭을 Autodesk Help 문서를 바탕으로 하나씩 알아보며 정리해 온 개인 학습 저장소입니다.

> 회사 계정에 올려도 되는지 확인이 안 되어 우선 개인 GitHub에 업로드했습니다.
> 회사 계정으로 전환이 필요하면 바로 옮기겠습니다.

---

## 빠른 시작 — 웹 대시보드 사용 방법

Revit / EnergyPlus가 출력한 HTM 보고서를 업로드하면 피크 부하, 존별 상세, 장비 사이징, 보고서 비교 등을 웹에서 바로 시각화할 수 있습니다.

### 1. 연간 건물 에너지 분석 (Annual Building Systems)

| 항목 | 링크 |
|---|---|
| 대시보드 | **[Annual Building Systems Analysis 열기](https://catsony5-web.github.io/Revit-Study-Personal/annual-building-systems/)** |
| 샘플 보고서 | [`docs/annual-building-systems/sample-reports/`](docs/annual-building-systems/sample-reports/) |

**샘플 파일 (2개)**
- `Annual Building Systems loadsRE1 ...htm`
- `Annual Building Systems loadsRE3 ...htm`

### 2. HVAC 기계설비 분석

| 항목 | 링크 |
|---|---|
| 대시보드 | **[HVAC Mechanical Analysis Dashboard 열기](https://catsony5-web.github.io/Revit-Study-Personal/hvac-dashboard/)** |
| 샘플 보고서 | [`docs/hvac-dashboard/sample-reports/`](docs/hvac-dashboard/sample-reports/) |

**샘플 파일 (4개)**
- `K-HVAC Systems loads1 ...htm`
- `K-HVAC Systems loads2 ...htm`
- `K-HVAC Systems loads3 ...htm`
- `K-HVAC Systems loads4 ...htm`

### 사용 순서

1. 위 **샘플 보고서** 폴더에서 HTM 파일을 다운로드합니다.
2. 해당 **대시보드 링크**를 열고, 다운로드한 HTM 파일을 드래그 또는 업로드합니다.
3. 여러 파일을 동시에 업로드하면 보고서 간 비교도 가능합니다.

---

## 프로젝트 구조

```
├── docs/                              ← 웹 대시보드 (GitHub Pages 배포)
│   ├── index.html                        포털 페이지
│   ├── annual-building-systems/
│   │   ├── index.html                    연간 에너지 분석 대시보드
│   │   └── sample-reports/               ★ 테스트용 HTM 샘플 보고서
│   └── hvac-dashboard/
│       ├── index.html                    HVAC 분석 대시보드
│       └── sample-reports/               ★ 테스트용 HTM 샘플 보고서
│
├── Revit_Energy_Analysis/             ← 에너지 분석 리서치 문서
│   ├── Report Data Files/                원본 데이터 및 분석 보고서
│   └── Report Settings Analysis Files/   시뮬레이션 세팅 분석 문서
│
├── Revit_Light_Analysis/              ← 조명 분석 리서치
│
├── images/                            ← 이미지 리소스
└── Zone-Equipment-Master-Guide.md     ← 구역 장비 마스터 가이드
```

## 문서

- [Revit 구역 장비(Zone Equipment) 마스터 가이드](Zone-Equipment-Master-Guide.md)
