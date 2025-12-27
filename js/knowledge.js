// ========================================
// 知識データベース
// ========================================
// ドラムを10回以上叩くとランダムに表示される知識リスト
// カテゴリー: 公式、数学者、科学者、歴史的発見など

const knowledgeItems = [
    // ============================================
    // カテゴリー: 数学・物理公式
    // ============================================
    // 小学生レベル
    {
        category: "公式",
        title: "三角形の面積",
        content: "底辺 × 高さ ÷ 2"
    },
    {
        category: "公式",
        title: "円の面積",
        content: "半径 × 半径 × 円周率"
    },
    {
        category: "公式",
        title: "円の周の長さ",
        content: "直径 × 円周率"
    },
    {
        category: "公式",
        title: "長方形の面積",
        content: "縦 × 横"
    },
    {
        category: "公式",
        title: "立方体の体積",
        content: "一辺 × 一辺 × 一辺"
    },

    // 中学生レベル
    {
        category: "公式",
        title: "速さの公式",
        content: "速さ = 距離 ÷ 時間"
    },
    {
        category: "公式",
        title: "ピタゴラスの定理",
        content: "a² + b² = c²"
    },
    {
        category: "公式",
        title: "二次方程式の解の公式",
        content: "x = (-b ± √(b²-4ac)) / 2a"
    },
    {
        category: "公式",
        title: "球の体積",
        content: "4/3 × π × r³"
    },
    {
        category: "公式",
        title: "密度の公式",
        content: "密度 = 質量 ÷ 体積"
    },

    // 高校生レベル
    {
        category: "公式",
        title: "運動方程式",
        content: "F = ma"
    },
    {
        category: "公式",
        title: "オームの法則",
        content: "V = IR"
    },
    {
        category: "公式",
        title: "力学的エネルギー保存則",
        content: "運動エネルギー + 位置エネルギー = 一定"
    },
    {
        category: "公式",
        title: "等加速度運動の公式",
        content: "v = v₀ + at"
    },
    {
        category: "公式",
        title: "万有引力の法則",
        content: "F = G(m₁m₂)/r²"
    },
    {
        category: "公式",
        title: "電力の公式",
        content: "P = VI"
    },
    {
        category: "公式",
        title: "ボイルの法則",
        content: "PV = 一定"
    },

    // 大学生レベル
    {
        category: "公式",
        title: "質量とエネルギーの等価性",
        content: "E = mc²"
    },
    {
        category: "公式",
        title: "不確定性原理",
        content: "ΔxΔp ≧ ℏ/2"
    },
    {
        category: "公式",
        title: "マクスウェル方程式（ガウスの法則）",
        content: "∇·E = ρ/ε₀"
    },
    {
        category: "公式",
        title: "シュレーディンガー方程式",
        content: "iℏ ∂ψ/∂t = Ĥψ"
    },
    {
        category: "公式",
        title: "アインシュタインの場の方程式",
        content: "Gμν = 8πG/c⁴ · Tμν"
    },
    {
        category: "公式",
        title: "ボルツマンの関係式",
        content: "S = k ln W"
    },
    {
        category: "公式",
        title: "プランクの関係式",
        content: "E = hν"
    },

    // ============================================
    // カテゴリー: 偉大な数学者
    // ============================================
    {
        category: "数学者",
        title: "ピタゴラス",
        content: "紀元前582年頃 - 紀元前496年頃<br>ピタゴラスの定理、万物は数"
    },
    {
        category: "数学者",
        title: "ユークリッド",
        content: "紀元前300年頃<br>原論、ユークリッド幾何学"
    },
    {
        category: "数学者",
        title: "アルキメデス",
        content: "紀元前287年頃 - 紀元前212年<br>円周率、浮力の原理"
    },
    {
        category: "数学者",
        title: "ブレーズ・パスカル",
        content: "1623年 - 1662年<br>確率論、計算機パスカリーヌ"
    },
    {
        category: "数学者",
        title: "ゴットフリート・ライプニッツ",
        content: "1646年 - 1716年<br>微分積分法、ライプニッツ記法"
    },
    {
        category: "数学者",
        title: "レオンハルト・オイラー",
        content: "1707年 - 1783年<br>オイラーの公式、多作"
    },
    {
        category: "数学者",
        title: "ジョゼフ＝ルイ・ラグランジュ",
        content: "1736年 - 1813年<br>解析学、ラグランジュの四平方定理"
    },
    {
        category: "数学者",
        title: "ソフィー・ジェルマン",
        content: "1776年 - 1831年<br>ソフィー・ジェルマン素数、数論"
    },
    {
        category: "数学者",
        title: "カール・フリードリヒ・ガウス",
        content: "1777年 - 1855年<br>数学の王、素数定理、ガウス曲率"
    },
    {
        category: "数学者",
        title: "エヴァリスト・ガロワ",
        content: "1811年 - 1832年<br>ガロワ理論、群論"
    },
    {
        category: "数学者",
        title: "ベルンハルト・リーマン",
        content: "1826年 - 1866年<br>リーマン幾何学、リーマン予想"
    },
    {
        category: "数学者",
        title: "ゲオルク・カントール",
        content: "1845年 - 1918年<br>集合論、無限集合"
    },
    {
        category: "数学者",
        title: "ダフィット・ヒルベルト",
        content: "1862年 - 1943年<br>ヒルベルトの23の問題"
    },
    {
        category: "数学者",
        title: "ジョン・フォン・ノイマン",
        content: "1903年 - 1957年<br>ゲーム理論、コンピュータ、量子力学"
    },
    {
        category: "数学者",
        title: "アンドリュー・ワイルズ",
        content: "1953年 - 現在<br>フェルマーの最終定理の証明"
    },

    // ============================================
    // カテゴリー: 分数と小数
    // ============================================
    {
        category: "分数と小数",
        title: "1/4 を小数で表すと？",
        content: "0.25"
    },
    {
        category: "分数と小数",
        title: "3/4 を小数で表すと？",
        content: "0.75"
    },
    {
        category: "分数と小数",
        title: "1/8 を小数で表すと？",
        content: "0.125"
    },
    {
        category: "分数と小数",
        title: "3/8 を小数で表すと？",
        content: "0.375"
    },
    {
        category: "分数と小数",
        title: "5/8 を小数で表すと？",
        content: "0.625"
    },
    {
        category: "分数と小数",
        title: "7/8 を小数で表すと？",
        content: "0.875"
    },
    {
        category: "分数と小数",
        title: "1/12 を小数で表すと？",
        content: "0.0833..."
    },
    {
        category: "分数と小数",
        title: "1/24 を小数で表すと？",
        content: "0.0416..."
    },

    // ============================================
    // カテゴリー: 平方数
    // ============================================
    {
        category: "平方数",
        title: "11 × 11 = ?",
        content: "121"
    },
    {
        category: "平方数",
        title: "12 × 12 = ?",
        content: "144"
    },
    {
        category: "平方数",
        title: "13 × 13 = ?",
        content: "169"
    },
    {
        category: "平方数",
        title: "14 × 14 = ?",
        content: "196"
    },
    {
        category: "平方数",
        title: "15 × 15 = ?",
        content: "225"
    },
    {
        category: "平方数",
        title: "16 × 16 = ?",
        content: "256"
    },
    {
        category: "平方数",
        title: "17 × 17 = ?",
        content: "289"
    },
    {
        category: "平方数",
        title: "18 × 18 = ?",
        content: "324"
    },
    {
        category: "平方数",
        title: "19 × 19 = ?",
        content: "361"
    },
    {
        category: "平方数",
        title: "20 × 20 = ?",
        content: "400"
    },

    // ============================================
    // カテゴリー: 元素記号（周期表1-20）
    // ============================================
    {
        category: "元素記号",
        title: "1番: H",
        content: "水素（Hydrogen）"
    },
    {
        category: "元素記号",
        title: "2番: He",
        content: "ヘリウム（Helium）"
    },
    {
        category: "元素記号",
        title: "3番: Li",
        content: "リチウム（Lithium）"
    },
    {
        category: "元素記号",
        title: "4番: Be",
        content: "ベリリウム（Beryllium）"
    },
    {
        category: "元素記号",
        title: "5番: B",
        content: "ホウ素（Boron）"
    },
    {
        category: "元素記号",
        title: "6番: C",
        content: "炭素（Carbon）"
    },
    {
        category: "元素記号",
        title: "7番: N",
        content: "窒素（Nitrogen）"
    },
    {
        category: "元素記号",
        title: "8番: O",
        content: "酸素（Oxygen）"
    },
    {
        category: "元素記号",
        title: "9番: F",
        content: "フッ素（Fluorine）"
    },
    {
        category: "元素記号",
        title: "10番: Ne",
        content: "ネオン（Neon）"
    },
    {
        category: "元素記号",
        title: "11番: Na",
        content: "ナトリウム（Sodium）"
    },
    {
        category: "元素記号",
        title: "12番: Mg",
        content: "マグネシウム（Magnesium）"
    },
    {
        category: "元素記号",
        title: "13番: Al",
        content: "アルミニウム（Aluminium）"
    },
    {
        category: "元素記号",
        title: "14番: Si",
        content: "ケイ素（Silicon）"
    },
    {
        category: "元素記号",
        title: "15番: P",
        content: "リン（Phosphorus）"
    },
    {
        category: "元素記号",
        title: "16番: S",
        content: "硫黄（Sulfur）"
    },
    {
        category: "元素記号",
        title: "17番: Cl",
        content: "塩素（Chlorine）"
    },
    {
        category: "元素記号",
        title: "18番: Ar",
        content: "アルゴン（Argon）"
    },
    {
        category: "元素記号",
        title: "19番: K",
        content: "カリウム（Potassium）"
    },
    {
        category: "元素記号",
        title: "20番: Ca",
        content: "カルシウム（Calcium）"
    },

    // ============================================
    // カテゴリー: 化学式（中学生レベル）
    // ============================================
    {
        category: "化学式",
        title: "水",
        content: "H₂O"
    },
    {
        category: "化学式",
        title: "二酸化炭素",
        content: "CO₂"
    },
    {
        category: "化学式",
        title: "酸素",
        content: "O₂"
    },
    {
        category: "化学式",
        title: "水素",
        content: "H₂"
    },
    {
        category: "化学式",
        title: "窒素",
        content: "N₂"
    },
    {
        category: "化学式",
        title: "アンモニア",
        content: "NH₃"
    },
    {
        category: "化学式",
        title: "塩化ナトリウム（食塩）",
        content: "NaCl"
    },
    {
        category: "化学式",
        title: "酸化銀",
        content: "Ag₂O"
    },
    {
        category: "化学式",
        title: "酸化銅",
        content: "CuO"
    },
    {
        category: "化学式",
        title: "硫化鉄",
        content: "FeS"
    },
    {
        category: "化学式",
        title: "炭酸水素ナトリウム（重曹）",
        content: "NaHCO₃"
    },
    {
        category: "化学式",
        title: "炭酸ナトリウム",
        content: "Na₂CO₃"
    },
    {
        category: "化学式",
        title: "塩化水素（塩酸）",
        content: "HCl"
    },
    {
        category: "化学式",
        title: "水酸化ナトリウム",
        content: "NaOH"
    },
    {
        category: "化学式",
        title: "硫酸",
        content: "H₂SO₄"
    },
    {
        category: "化学式",
        title: "マグネシウムの燃焼",
        content: "2Mg + O₂ → 2MgO"
    }
];

// 後方互換性のため、formulasという名前でもアクセス可能にする
const formulas = knowledgeItems;
