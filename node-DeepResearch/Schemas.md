# OpenAI JSON Mode Schemas 文档

本文档详细描述了 `schemas.ts` 文件中的所有schema，并将它们转换为OpenAI风格的JSON Mode格式。

## 1. Language Schema

**调用函数**: `getLanguageSchema()`  
**用途**: 识别输入文本的语言代码和语言风格

```json
{
  "type": "object",
  "properties": {
    "langCode": {
      "type": "string",
      "description": "ISO 639-1 language code",
      "maxLength": 10
    },
    "langStyle": {
      "type": "string", 
      "description": "[vibe & tone] in [what language], such as formal english, informal chinese, technical german, humor english, slang, genZ, emojis etc.",
      "maxLength": 100
    }
  },
  "required": ["langCode", "langStyle"],
  "additionalProperties": false
}
```

## 2. Question Evaluate Schema

**调用函数**: `getQuestionEvaluateSchema()`  
**用途**: 评估问题需要的检查类型

```json
{
  "type": "object",
  "properties": {
    "think": {
      "type": "string",
      "description": "A very concise explain of why those checks are needed",
      "maxLength": 500
    },
    "needsDefinitive": {
      "type": "boolean"
    },
    "needsFreshness": {
      "type": "boolean"
    },
    "needsPlurality": {
      "type": "boolean"
    },
    "needsCompleteness": {
      "type": "boolean"
    }
  },
  "required": ["think", "needsDefinitive", "needsFreshness", "needsPlurality", "needsCompleteness"],
  "additionalProperties": false
}
```

## 3. Code Generator Schema

**调用函数**: `getCodeGeneratorSchema()`  
**用途**: 生成JavaScript代码解决问题

```json
{
  "type": "object",
  "properties": {
    "think": {
      "type": "string",
      "description": "Short explain or comments on the thought process behind the code",
      "maxLength": 200
    },
    "code": {
      "type": "string",
      "description": "The JavaScript code that solves the problem and always use 'return' statement to return the result. Focus on solving the core problem; No need for error handling or try-catch blocks or code comments. No need to declare variables that are already available, especially big long strings or arrays."
    }
  },
  "required": ["think", "code"],
  "additionalProperties": false
}
```

## 4. Error Analysis Schema

**调用函数**: `getErrorAnalysisSchema()`  
**用途**: 分析错误和提供改进建议

```json
{
  "type": "object",
  "properties": {
    "recap": {
      "type": "string",
      "description": "Recap of the actions taken and the steps conducted in first person narrative",
      "maxLength": 500
    },
    "blame": {
      "type": "string",
      "description": "Which action or the step was the root cause of the answer rejection",
      "maxLength": 500
    },
    "improvement": {
      "type": "string",
      "description": "Suggested key improvement for the next iteration, do not use bullet points, be concise and hot-take vibe",
      "maxLength": 500
    }
  },
  "required": ["recap", "blame", "improvement"],
  "additionalProperties": false
}
```

## 5. Research Plan Schema

**调用函数**: `getResearchPlanSchema(teamSize)`  
**用途**: 将研究问题分解为多个正交的子问题

```json
{
  "type": "object",
  "properties": {
    "think": {
      "type": "string",
      "description": "Explain your decomposition strategy and how you ensured orthogonality between subproblems",
      "maxLength": 300
    },
    "subproblems": {
      "type": "array",
      "description": "Array of exactly N orthogonal research plans, each focusing on a different fundamental dimension of the main topic",
      "items": {
        "type": "string",
        "description": "Complete research plan containing: title, scope, key questions, methodology",
        "maxLength": 500
      },
      "minItems": 3,
      "maxItems": 3
    }
  },
  "required": ["think", "subproblems"],
  "additionalProperties": false
}
```

## 6. SERP Cluster Schema

**调用函数**: `getSerpClusterSchema()`  
**用途**: 将搜索引擎结果进行聚类分析

```json
{
  "type": "object",
  "properties": {
    "think": {
      "type": "string",
      "description": "Short explain of why you group the search results like this",
      "maxLength": 500
    },
    "clusters": {
      "type": "array",
      "description": "The optimal clustering of search engine results, orthogonal to each other. Maximum 5 clusters allowed",
      "maxItems": 5,
      "items": {
        "type": "object",
        "properties": {
          "insight": {
            "type": "string",
            "description": "Summary and list key numbers, data, soundbites, and insights that worth to be highlighted. End with an actionable advice such as \"Visit these URLs if you want to understand [what...]\". Do not use \"This cluster...\"",
            "maxLength": 200
          },
          "question": {
            "type": "string",
            "description": "What concrete and specific question this cluster answers. Should not be general question like \"where can I find [what...]\"",
            "maxLength": 100
          },
          "urls": {
            "type": "array",
            "items": {
              "type": "string",
              "description": "URLs in this cluster",
              "maxLength": 100
            }
          }
        },
        "required": ["insight", "question", "urls"],
        "additionalProperties": false
      }
    }
  },
  "required": ["think", "clusters"],
  "additionalProperties": false
}
```

## 7. Query Rewriter Schema

**调用函数**: `getQueryRewriterSchema()`  
**用途**: 重写和优化搜索查询

```json
{
  "type": "object",
  "properties": {
    "think": {
      "type": "string",
      "description": "Explain why you choose those search queries",
      "maxLength": 500
    },
    "queries": {
      "type": "array",
      "description": "Array of search keywords queries, orthogonal to each other. Maximum 5 queries allowed",
      "maxItems": 5,
      "items": {
        "type": "object",
        "properties": {
          "tbs": {
            "type": "string",
            "enum": ["qdr:h", "qdr:d", "qdr:w", "qdr:m", "qdr:y"],
            "description": "time-based search filter, must use this field if the search request asks for latest info. qdr:h for past hour, qdr:d for past 24 hours, qdr:w for past week, qdr:m for past month, qdr:y for past year. Choose exactly one."
          },
          "location": {
            "type": "string",
            "description": "defines from where you want the search to originate. It is recommended to specify location at the city level in order to simulate a real user's search."
          },
          "q": {
            "type": "string",
            "description": "keyword-based search query, 2-3 words preferred, total length < 30 characters",
            "maxLength": 50
          }
        },
        "required": ["tbs", "q"],
        "additionalProperties": false
      }
    }
  },
  "required": ["think", "queries"],
  "additionalProperties": false
}
```

## 8. Evaluator Schemas

**调用函数**: `getEvaluatorSchema(evalType)`  
**用途**: 根据不同评估类型进行内容评估

### 8.1 Definitive Evaluator

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "const": "definitive"
    },
    "think": {
      "type": "string",
      "description": "Explanation the thought process why the answer does not pass the evaluation",
      "maxLength": 500
    },
    "pass": {
      "type": "boolean",
      "description": "If the answer passes the test defined by the evaluator"
    }
  },
  "required": ["type", "think", "pass"],
  "additionalProperties": false
}
```

### 8.2 Freshness Evaluator

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "const": "freshness"
    },
    "think": {
      "type": "string",
      "description": "Explanation the thought process why the answer does not pass the evaluation",
      "maxLength": 500
    },
    "freshness_analysis": {
      "type": "object",
      "properties": {
        "days_ago": {
          "type": "number",
          "description": "datetime of the **answer** and relative to current date",
          "minimum": 0
        },
        "max_age_days": {
          "type": "number",
          "description": "Maximum allowed age in days for this kind of question-answer type before it is considered outdated"
        }
      },
      "required": ["days_ago"],
      "additionalProperties": false
    },
    "pass": {
      "type": "boolean",
      "description": "If \"days_ago\" <= \"max_age_days\" then pass!"
    }
  },
  "required": ["type", "think", "freshness_analysis", "pass"],
  "additionalProperties": false
}
```

### 8.3 Plurality Evaluator

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "const": "plurality"
    },
    "think": {
      "type": "string",
      "description": "Explanation the thought process why the answer does not pass the evaluation",
      "maxLength": 500
    },
    "plurality_analysis": {
      "type": "object",
      "properties": {
        "minimum_count_required": {
          "type": "number",
          "description": "Minimum required number of items from the **question**"
        },
        "actual_count_provided": {
          "type": "number",
          "description": "Number of items provided in **answer**"
        }
      },
      "required": ["minimum_count_required", "actual_count_provided"],
      "additionalProperties": false
    },
    "pass": {
      "type": "boolean",
      "description": "If count_provided >= count_expected then pass!"
    }
  },
  "required": ["type", "think", "plurality_analysis", "pass"],
  "additionalProperties": false
}
```

### 8.4 Attribution Evaluator

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "const": "attribution"
    },
    "think": {
      "type": "string",
      "description": "Explanation the thought process why the answer does not pass the evaluation",
      "maxLength": 500
    },
    "exactQuote": {
      "type": "string",
      "description": "Exact relevant quote and evidence from the source that strongly support the answer and justify this question-answer pair",
      "maxLength": 200
    },
    "pass": {
      "type": "boolean",
      "description": "If the answer passes the test defined by the evaluator"
    }
  },
  "required": ["type", "think", "pass"],
  "additionalProperties": false
}
```

### 8.5 Completeness Evaluator

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "const": "completeness"
    },
    "think": {
      "type": "string",
      "description": "Explanation the thought process why the answer does not pass the evaluation",
      "maxLength": 500
    },
    "completeness_analysis": {
      "type": "object",
      "properties": {
        "aspects_expected": {
          "type": "string",
          "description": "Comma-separated list of all aspects or dimensions that the question explicitly asks for",
          "maxLength": 100
        },
        "aspects_provided": {
          "type": "string",
          "description": "Comma-separated list of all aspects or dimensions that were actually addressed in the answer",
          "maxLength": 100
        }
      },
      "required": ["aspects_expected", "aspects_provided"],
      "additionalProperties": false
    },
    "pass": {
      "type": "boolean",
      "description": "If the answer passes the test defined by the evaluator"
    }
  },
  "required": ["type", "think", "completeness_analysis", "pass"],
  "additionalProperties": false
}
```

### 8.6 Strict Evaluator

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "const": "strict"
    },
    "think": {
      "type": "string",
      "description": "Explanation the thought process why the answer does not pass the evaluation",
      "maxLength": 500
    },
    "improvement_plan": {
      "type": "string",
      "description": "Explain how a perfect answer should look like and what are needed to improve the current answer. Starts with \"For the best answer, you must...\"",
      "maxLength": 1000
    },
    "pass": {
      "type": "boolean",
      "description": "If the answer passes the test defined by the evaluator"
    }
  },
  "required": ["type", "think", "improvement_plan", "pass"],
  "additionalProperties": false
}
```

## 9. Agent Schema

**调用函数**: `getAgentSchema(allowReflect, allowRead, allowAnswer, allowSearch, allowCoding, currentQuestion)`  
**用途**: 智能体行动选择和执行

```json
{
  "type": "object",
  "properties": {
    "think": {
      "type": "string",
      "description": "Concisely explain your reasoning process",
      "maxLength": 500
    },
    "action": {
      "type": "string",
      "enum": ["search", "coding", "answer", "reflect", "visit"],
      "description": "Choose exactly one best action from the available actions"
    },
    "search": {
      "type": "object",
      "properties": {
        "searchRequests": {
          "type": "array",
          "description": "Required when action='search'. Always prefer a single search query, only add another search query if the original question covers multiple aspects or elements and one search request is definitely not enough",
          "maxItems": 5,
          "items": {
            "type": "string",
            "minLength": 1,
            "maxLength": 30,
            "description": "A Google search query. Based on the deep intention behind the original question and the expected answer format"
          }
        }
      },
      "required": ["searchRequests"],
      "additionalProperties": false
    },
    "coding": {
      "type": "object",
      "properties": {
        "codingIssue": {
          "type": "string",
          "maxLength": 500,
          "description": "Required when action='coding'. Describe what issue to solve with coding, format like a github issue ticket. Specify the input value when it is short."
        }
      },
      "required": ["codingIssue"],
      "additionalProperties": false
    },
    "answer": {
      "type": "object",
      "properties": {
        "answer": {
          "type": "string",
          "description": "Required when action='answer'. Use all your knowledge you have collected, cover multiple aspects if needed. Must be definitive, no ambiguity, no uncertainty, no disclaimers."
        }
      },
      "required": ["answer"],
      "additionalProperties": false
    },
    "reflect": {
      "type": "object",
      "properties": {
        "questionsToAnswer": {
          "type": "array",
          "maxItems": 2,
          "description": "Required when action='reflect'. Reflection and planing, generate a list of most important questions to fill the knowledge gaps",
          "items": {
            "type": "string",
            "description": "Ensure each reflection question cuts to core emotional truths while staying anchored to original question"
          }
        }
      },
      "required": ["questionsToAnswer"],
      "additionalProperties": false
    },
    "visit": {
      "type": "object",
      "properties": {
        "URLTargets": {
          "type": "array",
          "maxItems": 5,
          "description": "Required when action='visit'. Must be the index of the URL in from the original list of URLs. Maximum 5 URLs allowed",
          "items": {
            "type": "number"
          }
        }
      },
      "required": ["URLTargets"],
      "additionalProperties": false
    }
  },
  "required": ["think", "action"],
  "additionalProperties": false,
  "oneOf": [
    {"required": ["search"]},
    {"required": ["coding"]},
    {"required": ["answer"]}, 
    {"required": ["reflect"]},
    {"required": ["visit"]}
  ]
}
```

## 总结

本文档共包含**9种主要schema类型**：

1. **Language Schema** - 语言识别
2. **Question Evaluate Schema** - 问题评估
3. **Code Generator Schema** - 代码生成
4. **Error Analysis Schema** - 错误分析
5. **Research Plan Schema** - 研究计划
6. **SERP Cluster Schema** - 搜索结果聚类
7. **Query Rewriter Schema** - 查询重写
8. **Evaluator Schema** - 内容评估（6个子类型）
9. **Agent Schema** - 智能体行动选择

其中Evaluator Schema包含6个不同的评估类型，Agent Schema根据不同的允许操作动态构建schema结构。所有schema都遵循OpenAI JSON Mode的格式标准，包含严格的类型定义、必需字段和额外属性控制。
