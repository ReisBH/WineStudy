import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Factory, Grape, Thermometer, Clock, Droplet, Wine, Sparkles, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useLanguage } from '../contexts/LanguageContext';

const productionMethods = {
  vinification: {
    title_pt: 'Vinificação',
    title_en: 'Vinification',
    description_pt: 'O processo de transformar uvas em vinho',
    description_en: 'The process of turning grapes into wine',
    icon: Grape,
    topics: [
      {
        id: 'red-winemaking',
        title_pt: 'Vinificação de Tintos',
        title_en: 'Red Winemaking',
        content_pt: `**Etapas da Vinificação de Vinhos Tintos:**

**1. Colheita (Vindima)**
- Momento crucial para qualidade final
- Manual ou mecânica
- Análise de açúcar, acidez e maturação fenólica

**2. Desengace e Esmagamento**
- Separação das bagas do engaço
- Esmagamento libera o mosto
- Alguns produtores mantêm cachos inteiros

**3. Maceração e Fermentação**
- Contato do mosto com cascas
- Extração de cor, taninos e aromas
- Temperatura: 25-30°C
- Duração: 1-4 semanas
- Remontagem (pumping over) ou pigeage (punch down)

**4. Fermentação Malolática**
- Conversão de ácido málico em lático
- Reduz acidez, adiciona cremosidade
- Ocorre naturalmente ou induzida

**5. Prensagem**
- Separação do vinho das cascas
- Vinho de gota (free-run) vs prensa
- Pressão suave para evitar amargor

**6. Envelhecimento**
- Em inox, concreto ou carvalho
- Micro-oxigenação e integração
- Estabilização e clarificação`,
        content_en: `**Red Wine Production Steps:**

**1. Harvest (Vendange)**
- Crucial moment for final quality
- Manual or mechanical
- Analysis of sugar, acidity and phenolic ripeness

**2. Destemming and Crushing**
- Separation of berries from stems
- Crushing releases the must
- Some producers keep whole bunches

**3. Maceration and Fermentation**
- Must contact with skins
- Extraction of color, tannins and aromas
- Temperature: 25-30°C
- Duration: 1-4 weeks
- Pumping over or punch down (pigeage)

**4. Malolactic Fermentation**
- Conversion of malic to lactic acid
- Reduces acidity, adds creaminess
- Occurs naturally or induced

**5. Pressing**
- Separation of wine from skins
- Free-run vs press wine
- Gentle pressure to avoid bitterness

**6. Aging**
- In stainless steel, concrete or oak
- Micro-oxygenation and integration
- Stabilization and clarification`
      },
      {
        id: 'white-winemaking',
        title_pt: 'Vinificação de Brancos',
        title_en: 'White Winemaking',
        content_pt: `**Etapas da Vinificação de Vinhos Brancos:**

**1. Colheita**
- Geralmente mais cedo que tintos
- Preservar acidez e frescor
- Colheita noturna para manter temperatura baixa

**2. Prensagem Direta**
- Sem maceração (geralmente)
- Prensagem suave e rápida
- Proteção contra oxidação (SO2, inertização)

**3. Clarificação do Mosto (Débourbage)**
- Decantação a frio (12-24h)
- Remoção de partículas sólidas
- Resulta em vinhos mais limpos

**4. Fermentação**
- Temperatura mais baixa: 12-18°C
- Preserva aromas primários
- Em inox (frescor) ou barrica (complexidade)
- Duração: 2-4 semanas

**5. Técnicas Especiais**

*Bâtonnage (Batimento das Borras)*
- Agitação das borras finas
- Adiciona textura cremosa
- Típico de Borgonha branca

*Fermentação em Barrica*
- Integração harmoniosa da madeira
- Notas de baunilha, noz, tostado

*Maceração Pelicular*
- Contato breve com cascas (2-24h)
- Aumenta corpo e complexidade
- Usado em vinhos laranjas`,
        content_en: `**White Wine Production Steps:**

**1. Harvest**
- Generally earlier than reds
- Preserve acidity and freshness
- Night harvest to maintain low temperature

**2. Direct Pressing**
- No maceration (usually)
- Gentle and quick pressing
- Protection against oxidation (SO2, inertization)

**3. Must Clarification (Débourbage)**
- Cold settling (12-24h)
- Removal of solid particles
- Results in cleaner wines

**4. Fermentation**
- Lower temperature: 12-18°C
- Preserves primary aromas
- In stainless steel (freshness) or barrel (complexity)
- Duration: 2-4 weeks

**5. Special Techniques**

*Bâtonnage (Lees Stirring)*
- Stirring of fine lees
- Adds creamy texture
- Typical of white Burgundy

*Barrel Fermentation*
- Harmonious wood integration
- Vanilla, nut, toast notes

*Skin Contact*
- Brief contact with skins (2-24h)
- Increases body and complexity
- Used in orange wines`
      }
    ]
  },
  sparkling: {
    title_pt: 'Espumantes',
    title_en: 'Sparkling Wines',
    description_pt: 'Métodos de produção de vinhos com bolhas',
    description_en: 'Production methods for wines with bubbles',
    icon: Sparkles,
    topics: [
      {
        id: 'traditional-method',
        title_pt: 'Método Tradicional (Champenoise)',
        title_en: 'Traditional Method (Champenoise)',
        content_pt: `**Método Tradicional - Usado em Champagne, Cava, Crémant**

**1. Vinho Base**
- Fermentação normal das uvas
- Assemblage de vinhos de diferentes anos
- Blend típico: Chardonnay, Pinot Noir, Pinot Meunier

**2. Tiragem (Tirage)**
- Adição de licor de tiragem
- Leveduras + açúcar
- Engarrafamento com tampa corona

**3. Segunda Fermentação**
- Ocorre na garrafa
- Produz CO2 (bolhas)
- Pressão: 5-6 atmosferas

**4. Envelhecimento Sur Lie**
- Sobre as borras de levedura
- Mínimo 15 meses (Champagne NV)
- 36+ meses para Vintage
- Desenvolve notas de brioche, pão

**5. Remuage (Riddling)**
- Rotação gradual das garrafas
- Concentra borras no gargalo
- Manual (pupitres) ou mecânico (gyropalettes)

**6. Dégorgement**
- Congelamento do gargalo
- Expulsão das borras
- Processo rápido e preciso

**7. Dosagem (Dosage)**
- Adição do licor de expedição
- Define nível de doçura:
  - Brut Nature: 0-3 g/L
  - Extra Brut: 0-6 g/L
  - Brut: 0-12 g/L
  - Extra Dry: 12-17 g/L
  - Sec: 17-32 g/L
  - Demi-Sec: 32-50 g/L`,
        content_en: `**Traditional Method - Used in Champagne, Cava, Crémant**

**1. Base Wine**
- Normal grape fermentation
- Assemblage of wines from different years
- Typical blend: Chardonnay, Pinot Noir, Pinot Meunier

**2. Tirage**
- Addition of tirage liquor
- Yeasts + sugar
- Bottling with crown cap

**3. Second Fermentation**
- Occurs in the bottle
- Produces CO2 (bubbles)
- Pressure: 5-6 atmospheres

**4. Sur Lie Aging**
- On yeast lees
- Minimum 15 months (Champagne NV)
- 36+ months for Vintage
- Develops brioche, bread notes

**5. Riddling (Remuage)**
- Gradual rotation of bottles
- Concentrates lees in neck
- Manual (pupitres) or mechanical (gyropalettes)

**6. Disgorgement (Dégorgement)**
- Freezing the neck
- Expulsion of lees
- Quick and precise process

**7. Dosage**
- Addition of expedition liquor
- Defines sweetness level:
  - Brut Nature: 0-3 g/L
  - Extra Brut: 0-6 g/L
  - Brut: 0-12 g/L
  - Extra Dry: 12-17 g/L
  - Sec: 17-32 g/L
  - Demi-Sec: 32-50 g/L`
      },
      {
        id: 'charmat-method',
        title_pt: 'Método Charmat (Tanque)',
        title_en: 'Charmat Method (Tank)',
        content_pt: `**Método Charmat - Usado em Prosecco, Lambrusco**

**Características:**
- Segunda fermentação em tanques pressurizados
- Mais rápido e econômico
- Bolhas maiores e menos persistentes
- Preserva frescor e aromas primários

**Processo:**
1. Vinho base transferido para tanque pressurizado
2. Adição de leveduras e açúcar
3. Fermentação por 1-6 semanas
4. Filtração sob pressão
5. Engarrafamento isobárico

**Ideal para:**
- Vinhos aromáticos (Moscato, Prosecco)
- Consumo jovem
- Produção em larga escala`,
        content_en: `**Charmat Method - Used in Prosecco, Lambrusco**

**Characteristics:**
- Second fermentation in pressurized tanks
- Faster and more economical
- Larger, less persistent bubbles
- Preserves freshness and primary aromas

**Process:**
1. Base wine transferred to pressurized tank
2. Addition of yeasts and sugar
3. Fermentation for 1-6 weeks
4. Filtration under pressure
5. Isobaric bottling

**Ideal for:**
- Aromatic wines (Moscato, Prosecco)
- Young consumption
- Large scale production`
      }
    ]
  },
  fortified: {
    title_pt: 'Fortificados',
    title_en: 'Fortified Wines',
    description_pt: 'Vinhos com adição de aguardente',
    description_en: 'Wines with spirit addition',
    icon: Thermometer,
    topics: [
      {
        id: 'port-wine',
        title_pt: 'Vinho do Porto',
        title_en: 'Port Wine',
        content_pt: `**Vinho do Porto - Douro, Portugal**

**Processo de Produção:**
1. Colheita de uvas autóctones (Touriga Nacional, Touriga Franca, etc.)
2. Fermentação parcial (2-3 dias)
3. Fortificação com aguardente vínica (77%)
4. Interrompe fermentação, preserva açúcar residual
5. Envelhecimento

**Estilos Principais:**

**Ruby (Envelhecimento Oxidativo Mínimo)**
- Ruby: Jovem, frutado
- Reserva: Mais complexo
- LBV (Late Bottled Vintage): 4-6 anos em madeira
- Vintage/Vintage: Declarado em anos excepcionais

**Tawny (Envelhecimento Oxidativo)**
- Tawny básico: Leve oxidação
- Reserva: 6-7 anos médios
- 10/20/30/40 Anos: Indicação de idade média
- Colheita: Ano único, longo envelhecimento

**Brancos e Rosés**
- White Port: Seco a doce
- Rosé: Recente, frutado`,
        content_en: `**Port Wine - Douro, Portugal**

**Production Process:**
1. Harvest of indigenous grapes (Touriga Nacional, Touriga Franca, etc.)
2. Partial fermentation (2-3 days)
3. Fortification with grape spirit (77%)
4. Stops fermentation, preserves residual sugar
5. Aging

**Main Styles:**

**Ruby (Minimal Oxidative Aging)**
- Ruby: Young, fruity
- Reserve: More complex
- LBV (Late Bottled Vintage): 4-6 years in wood
- Vintage/Vintage: Declared in exceptional years

**Tawny (Oxidative Aging)**
- Basic Tawny: Light oxidation
- Reserve: 6-7 average years
- 10/20/30/40 Years: Average age indication
- Colheita: Single year, long aging

**Whites and Rosés**
- White Port: Dry to sweet
- Rosé: Recent, fruity`
      },
      {
        id: 'sherry',
        title_pt: 'Jerez (Sherry)',
        title_en: 'Sherry',
        content_pt: `**Jerez - Andaluzia, Espanha**

**Uvas:** Palomino Fino (secos), Pedro Ximénez, Moscatel (doces)

**Sistema de Solera:**
- Empilhamento de barricas (criaderas)
- Vinho mais velho embaixo (solera)
- Retirada parcial para engarrafamento
- Reposição com vinho mais jovem
- Garante consistência ao longo dos anos

**Estilos:**

**Envelhecimento Biológico (Sob Flor)**
- Fino: Seco, leve, notas de amêndoa
- Manzanilla: De Sanlúcar, mais salino
- Flor: Véu de levedura que protege da oxidação

**Envelhecimento Oxidativo**
- Oloroso: Encorpado, nozes, caramelo
- Amontillado: Começa biológico, termina oxidativo
- Palo Cortado: Raro, combina características

**Doces**
- Pedro Ximénez (PX): Muito doce, viscoso
- Cream: Blend de Oloroso + PX`,
        content_en: `**Sherry - Andalusia, Spain**

**Grapes:** Palomino Fino (dry), Pedro Ximénez, Moscatel (sweet)

**Solera System:**
- Stacking of barrels (criaderas)
- Oldest wine at bottom (solera)
- Partial withdrawal for bottling
- Replenishment with younger wine
- Ensures consistency over the years

**Styles:**

**Biological Aging (Under Flor)**
- Fino: Dry, light, almond notes
- Manzanilla: From Sanlúcar, more saline
- Flor: Yeast veil that protects from oxidation

**Oxidative Aging**
- Oloroso: Full-bodied, nuts, caramel
- Amontillado: Starts biological, ends oxidative
- Palo Cortado: Rare, combines characteristics

**Sweet**
- Pedro Ximénez (PX): Very sweet, viscous
- Cream: Blend of Oloroso + PX`
      }
    ]
  },
  sweet: {
    title_pt: 'Vinhos Doces',
    title_en: 'Sweet Wines',
    description_pt: 'Técnicas para produção de vinhos doces',
    description_en: 'Techniques for sweet wine production',
    icon: Droplet,
    topics: [
      {
        id: 'botrytis',
        title_pt: 'Botrytis (Podridão Nobre)',
        title_en: 'Botrytis (Noble Rot)',
        content_pt: `**Botrytis Cinerea - A Podridão Nobre**

**Condições Necessárias:**
- Manhãs úmidas e nebulosas
- Tardes secas e ensolaradas
- Uvas de casca fina

**Processo:**
1. Fungo perfura a casca das uvas
2. Água evapora, concentra açúcar
3. Uvas "passificam" na videira
4. Colheita manual, passagens múltiplas
5. Fermentação lenta e parcial

**Características dos Vinhos:**
- Doçura intensa
- Acidez vibrante para equilíbrio
- Aromas de mel, damasco, açafrão
- Extrema longevidade

**Regiões Famosas:**
- Sauternes (Bordeaux) - Sémillon, Sauvignon Blanc
- Tokaji (Hungria) - Furmint, Hárslevelű
- Trockenbeerenauslese (Alemanha/Áustria) - Riesling
- Loire (Coteaux du Layon, Bonnezeaux)`,
        content_en: `**Botrytis Cinerea - Noble Rot**

**Required Conditions:**
- Humid, foggy mornings
- Dry, sunny afternoons
- Thin-skinned grapes

**Process:**
1. Fungus pierces grape skin
2. Water evaporates, sugar concentrates
3. Grapes "raisin" on the vine
4. Manual harvest, multiple passes
5. Slow, partial fermentation

**Wine Characteristics:**
- Intense sweetness
- Vibrant acidity for balance
- Honey, apricot, saffron aromas
- Extreme longevity

**Famous Regions:**
- Sauternes (Bordeaux) - Sémillon, Sauvignon Blanc
- Tokaji (Hungary) - Furmint, Hárslevelű
- Trockenbeerenauslese (Germany/Austria) - Riesling
- Loire (Coteaux du Layon, Bonnezeaux)`
      },
      {
        id: 'ice-wine',
        title_pt: 'Icewine (Vinho de Gelo)',
        title_en: 'Ice Wine',
        content_pt: `**Icewine / Eiswein**

**Processo:**
- Uvas deixadas na videira até congelar
- Colheita a temperaturas abaixo de -7°C
- Prensagem imediata enquanto congeladas
- Água congela, suco concentrado flui

**Características:**
- Doçura intensa
- Acidez muito alta
- Aromas de frutas tropicais, mel
- Produção muito limitada

**Regiões:**
- Canadá (Ontário, BC)
- Alemanha (Rheingau, Mosel)
- Áustria

**Curiosidade:**
- Risco alto (pássaros, clima)
- Uma garrafa requer ~3kg de uvas
- Preços elevados pela raridade`,
        content_en: `**Ice Wine / Eiswein**

**Process:**
- Grapes left on vine until frozen
- Harvest at temperatures below -7°C
- Immediate pressing while frozen
- Water freezes, concentrated juice flows

**Characteristics:**
- Intense sweetness
- Very high acidity
- Tropical fruit, honey aromas
- Very limited production

**Regions:**
- Canada (Ontario, BC)
- Germany (Rheingau, Mosel)
- Austria

**Fun Fact:**
- High risk (birds, weather)
- One bottle requires ~3kg of grapes
- High prices due to rarity`
      }
    ]
  },
  oak: {
    title_pt: 'Envelhecimento em Carvalho',
    title_en: 'Oak Aging',
    description_pt: 'Influência da madeira no vinho',
    description_en: 'Wood influence on wine',
    icon: Factory,
    topics: [
      {
        id: 'oak-types',
        title_pt: 'Tipos de Carvalho',
        title_en: 'Oak Types',
        content_pt: `**Tipos de Carvalho e Suas Características**

**Carvalho Francês**
- Origem: Tronçais, Allier, Nevers, Vosges, Limousin
- Grão fino
- Taninos elegantes e suaves
- Notas de baunilha, especiarias
- Preço mais alto
- Preferido para Pinot Noir e Chardonnay

**Carvalho Americano**
- Origem: Missouri, Minnesota, Wisconsin
- Grão mais aberto
- Taninos mais agressivos
- Notas de coco, baunilha intensa, endro
- Preço mais acessível
- Popular para Rioja, Bourbon

**Carvalho da Europa Central**
- Húngaro, Esloveno, Russo
- Características intermediárias
- Custo-benefício
- Crescente popularidade

**Níveis de Tosta:**
- Leve: Aromas sutis, preserva fruta
- Média: Baunilha, caramelo
- Média+: Café, chocolate
- Alta: Defumado, torrado`,
        content_en: `**Oak Types and Their Characteristics**

**French Oak**
- Origin: Tronçais, Allier, Nevers, Vosges, Limousin
- Tight grain
- Elegant, soft tannins
- Vanilla, spice notes
- Higher price
- Preferred for Pinot Noir and Chardonnay

**American Oak**
- Origin: Missouri, Minnesota, Wisconsin
- More open grain
- More aggressive tannins
- Coconut, intense vanilla, dill notes
- More affordable
- Popular for Rioja, Bourbon

**Central European Oak**
- Hungarian, Slovenian, Russian
- Intermediate characteristics
- Cost-effective
- Growing popularity

**Toast Levels:**
- Light: Subtle aromas, preserves fruit
- Medium: Vanilla, caramel
- Medium+: Coffee, chocolate
- High: Smoky, roasted`
      }
    ]
  }
};

const ProductionMethodsPage = () => {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('vinification');
  const [activeTopic, setActiveTopic] = useState('red-winemaking');

  const currentCategory = productionMethods[activeCategory];
  const currentTopic = currentCategory?.topics.find(t => t.id === activeTopic) || currentCategory?.topics[0];

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
            {language === 'pt' ? 'Métodos de Produção' : 'Production Methods'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {language === 'pt' 
              ? 'Aprenda como os diferentes tipos de vinho são produzidos'
              : 'Learn how different types of wine are produced'}
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3">
            {Object.entries(productionMethods).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveCategory(key);
                    setActiveTopic(category.topics[0].id);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-sm transition-all ${
                    activeCategory === key
                      ? 'bg-wine-500 text-white'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                  data-testid={`production-tab-${key}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">
                    {language === 'pt' ? category.title_pt : category.title_en}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Topic List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="border-border/40 sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg">
                  {language === 'pt' ? currentCategory?.title_pt : currentCategory?.title_en}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {language === 'pt' ? currentCategory?.description_pt : currentCategory?.description_en}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentCategory?.topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setActiveTopic(topic.id)}
                    className={`w-full text-left px-4 py-3 rounded-sm transition-all flex items-center justify-between ${
                      activeTopic === topic.id
                        ? 'bg-wine-500/10 text-wine-600 font-medium'
                        : 'hover:bg-muted'
                    }`}
                    data-testid={`topic-${topic.id}`}
                  >
                    <span>{language === 'pt' ? topic.title_pt : topic.title_en}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${activeTopic === topic.id ? 'rotate-90' : ''}`} />
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div
            key={activeTopic}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">
                  {language === 'pt' ? currentTopic?.title_pt : currentTopic?.title_en}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-wine max-w-none">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {(language === 'pt' ? currentTopic?.content_pt : currentTopic?.content_en)
                      ?.split('\n')
                      .map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <h3 key={i} className="font-serif text-lg font-semibold mt-6 mb-3 text-wine-600">{line.replace(/\*\*/g, '')}</h3>;
                        }
                        if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
                          return <p key={i} className="italic text-muted-foreground mb-2">{line.replace(/\*/g, '')}</p>;
                        }
                        if (line.startsWith('- ')) {
                          return <li key={i} className="ml-4 mb-1">{line.substring(2)}</li>;
                        }
                        if (line.match(/^\d+\./)) {
                          return <li key={i} className="ml-4 mb-1 list-decimal">{line.substring(line.indexOf('.') + 2)}</li>;
                        }
                        return line ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Related Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="border-border/40 bg-wine-500/5">
            <CardContent className="p-6">
              <h3 className="font-serif text-lg font-semibold mb-4">
                {language === 'pt' ? 'Continue Aprendendo' : 'Continue Learning'}
              </h3>
              <div className="flex flex-wrap gap-4">
                <Link to="/study">
                  <Badge variant="outline" className="py-2 px-4 cursor-pointer hover:bg-wine-500/10">
                    📚 {language === 'pt' ? 'Trilhas de Estudo' : 'Study Tracks'}
                  </Badge>
                </Link>
                <Link to="/grapes">
                  <Badge variant="outline" className="py-2 px-4 cursor-pointer hover:bg-wine-500/10">
                    🍇 {language === 'pt' ? 'Banco de Castas' : 'Grape Database'}
                  </Badge>
                </Link>
                <Link to="/atlas">
                  <Badge variant="outline" className="py-2 px-4 cursor-pointer hover:bg-wine-500/10">
                    🌍 {language === 'pt' ? 'Atlas de Regiões' : 'Region Atlas'}
                  </Badge>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductionMethodsPage;
