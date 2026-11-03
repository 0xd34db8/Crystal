import { SyllabusData } from "@/types/syllabus";

export const initialSyllabusData: SyllabusData = {
  id: "syllabus-ml-101",
  fileName: "Name of the file",
  lastModified: "Today at 05:30 AM",
  items: [
    {
      id: "unit-1",
      title: "UNIT I: Introduction to Machine Learning",
      status: "untouched",
      hasNote: false,
      isExpanded: true,
      children: [
        {
          id: "unit-1-1",
          title: "Preface of Machine Learning",
          status: "done",
          hasNote: true,
          note: {
            id: "note-1-1",
            title: "Preface of Machine Learning",
            content: `### Overview & Foundations

Machine Learning is a subset of artificial intelligence focusing on building applications that learn from data and improve their accuracy over time without being explicitly programmed.

#### Key Principles:
- **Representation**: Knowledge representation through models (decision trees, neural nets).
- **Evaluation**: Objective or loss functions to score models.
- **Optimization**: Search methods like gradient descent.`,
            updatedAt: "2026-11-01 10:14 AM",
            subComments: [
              {
                id: "c-1",
                author: "Notes",
                timestamp: "Nov 01, 2026 at 10:30 AM",
                content: "Crucial difference: Classical programming (Data + Program = Output) vs Machine Learning (Data + Output = Program).",
              },
            ],
          },
        },
        {
          id: "unit-1-2",
          title: "DS Life Cycle",
          status: "untouched",
          hasNote: false,
        },
        {
          id: "unit-1-3",
          title: "Types of Learning",
          status: "untouched",
          hasNote: false,
          isExpanded: true,
          children: [
            {
              id: "unit-1-3-1",
              title: "Supervised",
              status: "done",
              hasNote: true,
              note: {
                id: "note-supervised",
                title: "Supervised",
                content: `### Supervised Learning Architecture

Supervised learning algorithms are trained using labeled examples, such as an input where the desired output is known.

#### Core Mechanics:
1. **Input Features ($X$)**: Matrix of observable variables.
2. **Target Labels ($Y$)**: Ground truth groundings for classification or regression.
3. **Hypothesis Function ($h_\\theta(x)$)**: Maps inputs to predicted outputs.
4. **Loss Function ($J(\\theta)$)**: Measures deviation between prediction and ground truth.

\`\`\`python
# Typical Supervised Workflow
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
clf = RandomForestClassifier(n_estimators=100)
clf.fit(X_train, y_train)
\`\`\`

#### Major Categories:
- **Classification**: Discrete output labels (e.g., Spam vs Ham, Disease diagnosis).
- **Regression**: Continuous numerical predictions (e.g., House prices, Temperature).`,
                updatedAt: "2026-11-02 02:45 PM",
                subComments: [
                  {
                    id: "sc-1",
                    author: "Sub-section: Bias-Variance Tradeoff",
                    timestamp: "Nov 02, 2026 at 03:00 PM",
                    content: "High bias leads to underfitting; high variance causes overfitting. Regularization (L1/L2) helps find the sweet spot.",
                  },
                  {
                    id: "sc-2",
                    author: "Sub-section: Evaluation Metrics",
                    timestamp: "Nov 02, 2026 at 03:15 PM",
                    content: "Precision = TP / (TP + FP)\nRecall = TP / (TP + FN)\nF1 Score = harmonic mean of Precision & Recall.",
                  },
                ],
              },
            },
            {
              id: "unit-1-3-2",
              title: "Unsupervised",
              status: "done",
              hasNote: true,
              note: {
                id: "note-unsupervised",
                title: "Unsupervised",
                content: `### Unsupervised Learning

Unsupervised learning algorithms learn patterns from unlabelled data.

- **Clustering**: K-Means, Hierarchical, DBSCAN
- **Dimensionality Reduction**: PCA, t-SNE, UMAP
- **Association Rule Mining**: Apriori, FP-Growth`,
                updatedAt: "2026-11-02 04:10 PM",
              },
            },
            {
              id: "unit-1-3-3",
              title: "Reinforcement",
              status: "untouched",
              hasNote: false,
            },
          ],
        },
        {
          id: "unit-1-4",
          title: "theory of learning",
          status: "untouched",
          hasNote: false,
          isExpanded: true,
          children: [
            {
              id: "unit-1-4-1",
              title: "feasibility of learning",
              status: "partial",
              hasNote: false,
            },
            {
              id: "unit-1-4-2",
              title: "error/noise",
              status: "barely",
              hasNote: false,
            },
          ],
        },
      ],
    },
    {
      id: "unit-2",
      title: "UNIT II: Supervised Learning",
      status: "untouched",
      hasNote: false,
      isExpanded: false,
      children: [
        {
          id: "unit-2-1",
          title: "Learning a Class from Examples",
          status: "untouched",
          hasNote: false,
        },
        {
          id: "unit-2-2",
          title: "Linear, Non-linear, Multi-class and Multi-label classification",
          status: "untouched",
          hasNote: false,
        },
        {
          id: "unit-2-3",
          title: "Generalization error bounds: VC Dimension, Decision Trees",
          status: "untouched",
          hasNote: false,
        },
      ],
    },
    {
      id: "unit-3",
      title: "UNIT III: Ensemble Learning",
      status: "untouched",
      hasNote: false,
      isExpanded: false,
      children: [
        {
          id: "unit-3-1",
          title: "Ensemble Learning Model Combination Schemes",
          status: "untouched",
          hasNote: false,
        },
        {
          id: "unit-3-2",
          title: "Voting, Error-Correcting Output Codes",
          status: "untouched",
          hasNote: false,
        },
        {
          id: "unit-3-3",
          title: "Bagging, Random Forest Trees, Boosting: Adaboost",
          status: "untouched",
          hasNote: false,
        },
      ],
    },
  ],
};
