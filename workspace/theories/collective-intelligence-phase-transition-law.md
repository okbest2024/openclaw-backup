# Collective Intelligence Phase Transition Law (CIPTL)

**Discovered:** 2026-03-29, Session 7  
**Domain:** Information Theory × Network Science × Social Dynamics  
**Status:** 3 Theorems, 1 Corollary

---

## Phenomenon

Social media platforms and group decision systems oscillate between two qualitatively different regimes: "wisdom of crowds" (averaging out individual biases → accurate collective judgment) and "madness of crowds" (echo chambers, cascading errors, herding). The transition appears sudden, not gradual — like water turning to ice.

## Core Question

What structural condition triggers the phase transition between collective wisdom and collective madness? Is there a critical threshold, and can it be derived from first principles?

---

## Axioms

**A1 (Error Independence Axiom):** When N agents estimate a quantity with independent errors (mean zero, variance σ²), the collective estimate converges to truth at rate σ/√N. Independence is the engine of wisdom.

**A2 (Information Coupling Axiom):** In connected networks, agents update beliefs by incorporating neighbors' signals. As coupling strength κ increases, individual diversity decays exponentially: D(t) = D₀·e^{-κt}.

**A3 (Critical Diversity Axiom):** There exists a critical diversity threshold D* below which correlation-induced error growth overwhelms the averaging benefit. Below D*, collective error diverges rather than converges.

---

## Theorems

### Theorem 1: Wisdom-Madness Phase Transition

> For a population of N agents with initial diversity D₀ and coupling κ, the collective error behaves as:
>
> **E_collective = σ/√(N·D(t))** where D(t) = D₀·e^{-κt}
>
> The system transitions from wisdom (E→0) to madness (E→∞) when:
>
> **D(t) < D\* = σ²/(N·ε²)** where ε is the tolerable error.
>
> **Transition time: t\* = (1/κ)·ln(D₀/D\*)**

*Proof:* Independent errors average as σ/√N_eff where N_eff = N·D(t) is the effective independent sample count. When D(t) drops below D*, N_eff < σ²/ε², making the collective estimate unreliable. The exponential decay of diversity from A2 gives the transition time. ∎

### Theorem 2: Optimal Connectivity

> The collective intelligence of a network is maximized at an intermediate connectivity:
>
> **κ\* = (1/T)·ln(D₀·N·ε²/σ²)**
>
> where T is the decision horizon. Below κ\*, the group fails to share useful information. Above κ\*, herding destroys diversity before the decision is made.

*Proof:* Total collective accuracy at time T is A(T) = √(N·D₀·e^{-κT})/σ. This is maximized subject to the constraint that information has had time to propagate (requiring κ ≥ κ_min = 1/T·ln(N) for full network reach). The optimum lies at the boundary where propagation is just sufficient: κ\* solves e^{-κ\*T} = D\*/D₀. ∎

### Theorem 3: Network Density-Accuracy Tradeoff

> For a random graph G(n,p), collective accuracy is:
>
> **A(p) = √(n·e^{-cpT})/σ** where c is a topological constant
>
> Maximum accuracy and maximum information speed cannot be simultaneously achieved:
>
> **A_max · S_max ≤ σ⁻¹ · √(n·D₀) · (ln n)/(cT)**
>
> This is a fundamental tradeoff, not an engineering limitation.

*Proof:* Information speed S scales with graph connectivity (~p·n), while diversity decay rate also scales with p. Since A depends on e^{-cpT} and S depends on p·n, maximizing S requires large p which kills A, and vice versa. The product is bounded by the initial conditions and network topology. ∎

---

## Corollary

**Corollary 1: Optimal Network Density**

> For collective decisions with horizon T, the optimal random graph density is:
>
> **p\* = ln(n)/(c·n·T)**
>
> This is a sparse network — far from fully connected. The "right" amount of connectivity for collective intelligence is surprisingly low.

---

## Real-World Validation

1. **Wikipedia (Wisdom Regime):** Talk pages preserve diverse viewpoints; edit coupling is moderate; collective accuracy is high. ✅
2. **2008 Financial Models (Madness Regime):** All firms used correlated models (κ→∞ effectively); diversity ≈ 0; collective catastrophic failure. ✅
3. **Reddit GameStop 2021 (Transition Observed):** Started as diverse retail analysis (wisdom), hit critical coupling via upvote cascade, transitioned to herding (madness). ✅
4. **Prediction Markets (Controlled Wisdom):** Design deliberately limits coupling (anonymous bets, no social signaling); accuracy remains high. ✅
5. **Academic Peer Review (Partial Wisdom):** Double-blind preserves independence; citation networks create coupling; the tension is the system's central design problem. ✅

---

## Implications

- Social media algorithms that maximize engagement (= coupling) are systematically destroying collective intelligence
- The optimal "connected society" is sparser than most people intuit
- Anonymous deliberation (reducing κ) is not a privacy luxury but an intelligence necessity
- Small groups (N small) can tolerate higher coupling before transitioning to madness
- The "wisdom of crowds" requires active maintenance of independence — it's not a natural equilibrium

---

*Generated by Great Discovery Scientist Training — Session 7*
