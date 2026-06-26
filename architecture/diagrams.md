# Diagrams

Brand palette: primary `#157347`, deep `#0F5132`, tint `#E6F4EC`, teal `#0E7490`, amber `#B54708`,
border `#E4E7EC`, text `#101828` / `#475467`.

## 1 · Closed-loop sequence — provision → nudge → reply → attribute → roll up

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#E6F4EC','primaryBorderColor':'#157347','primaryTextColor':'#101828','lineColor':'#475467','actorBkg':'#E6F4EC','actorBorder':'#157347','signalColor':'#475467','signalTextColor':'#101828','noteBkgColor':'#FEF0C7','noteBorderColor':'#B54708'}}}%%
sequenceDiagram
    autonumber
    actor P as Partner · Outturn
    participant API as Outturn API · Vercel
    participant DDB as DynamoDB · agrinexus-data
    participant ENG as AgriNexus engine
    participant WA as WhatsApp · Farmer
    participant AGG as OutcomesAggregator λ

    P->>API: Provision + activate cohort
    API->>DDB: PutItem COHORT# (GSI2 = active)
    ENG->>DDB: Query GSI2 — active cohorts
    ENG->>DDB: Query GSI1 LOCATION# — recipients
    ENG->>WA: Send nudge · PutItem NUDGE# = SENT
    WA-->>ENG: Reply "हो गया / Done"
    ENG->>DDB: UpdateItem NUDGE# = DONE
    DDB-->>AGG: Stream MODIFY event
    AGG->>DDB: GetItem PHONE#/MEMBERSHIP — attribute by phone
    AGG->>DDB: UpdateItem SUMMARY# — atomic ADD
    P->>API: Open dashboard
    API->>DDB: Read SUMMARY# — one item per cohort
    API-->>P: Follow-through by cohort
```

## 2 · Three-plane system — Outturn / DynamoDB / AgriNexus

```mermaid
%%{init: {'theme':'base','themeVariables':{'fontFamily':'Inter, system-ui, sans-serif','lineColor':'#475467','primaryTextColor':'#101828'}}}%%
flowchart TB
    subgraph CTRL["Control plane · Outturn (Vercel)"]
        direction TB
        L["Login / personas"]
        W["Cohort wizard"]
        D["Dashboard"]
        B["Billing"]
        R["API routes (server)"]
    end
    subgraph DATA["Data plane · Amazon DynamoDB"]
        direction TB
        T[("agrinexus-data<br/>single table")]
        G1["GSI1 · cohort members"]
        G2["GSI2 · active cohorts"]
        STR[["Streams"]]
    end
    subgraph DEL["Delivery plane · AgriNexus engine (AWS)"]
        direction TB
        PO["Weather poller"]
        SF["Step Functions"]
        NS["NudgeSender λ"]
        RD["Response detector λ"]
        MW["WhatsApp Business API"]
    end
    AGG["OutcomesAggregator λ<br/>SUMMARY# rollups"]
    ST["Stripe"]
    SM[("Secrets Manager")]

    W --> R
    D --> R
    B --> ST
    R -->|"PutItem / Query · tenant-scoped"| T
    R -.->|creds| SM
    T --- G1
    T --- G2
    G2 --> PO
    PO --> SF --> NS --> MW
    MW --> RD -->|"NUDGE# → DONE"| T
    NS -->|"NUDGE# = SENT"| T
    T --> STR --> AGG -->|"SUMMARY#"| T
    D -->|"read SUMMARY#"| T

    classDef ctrl fill:#E6F4EC,stroke:#157347,color:#0F5132;
    classDef data fill:#E0F2F7,stroke:#0E7490,color:#0E5063;
    classDef del fill:#FEF0C7,stroke:#B54708,color:#7A3A06;
    classDef ext fill:#F2F4F7,stroke:#98A2B3,color:#475467;
    class L,W,D,B,R ctrl;
    class T,G1,G2,STR data;
    class PO,SF,NS,RD,MW del;
    class AGG,ST,SM ext;
    style CTRL fill:#F7FBF8,stroke:#157347,color:#0F5132;
    style DATA fill:#F5FBFC,stroke:#0E7490,color:#0E5063;
    style DEL fill:#FFFBF2,stroke:#B54708,color:#7A3A06;
```

> Note on accuracy: outbound recipients are selected by district (`GSI1 LOCATION#` on the engine's
> farmer profiles); inbound outcomes are attributed by phone (`PHONE#/MEMBERSHIP`). The loop closes
> for a farmer who is both enrolled by a partner and opted-in over WhatsApp.
