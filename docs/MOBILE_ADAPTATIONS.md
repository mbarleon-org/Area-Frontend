# Adaptations Mobile du Canvas

## Résumé des changements

Le canvas a été entièrement adapté pour une utilisation mobile avec des breakpoints responsives et des interactions tactiles améliorées.

## Seuil mobile
- **Breakpoint**: 768px (largeur d'écran)
- Tous les composants détectent automatiquement la taille de l'écran et s'adaptent en conséquence

## Composants modifiés

### 1. **AddNode.tsx**
- ✅ Menu latéral responsive : 30% sur desktop → 90% sur mobile
- ✅ Largeur maximale ajustée pour mobile
- ✅ Bordures arrondies adaptées

### 2. **BinButton.tsx**
- ✅ Positionnement centré sur mobile (bottom center)
- ✅ Taille réduite : 64px → 56px sur mobile
- ✅ Position ajustée pour éviter les conflits avec autres boutons

### 3. **TopBar.tsx**
- ✅ Suppression du décalage gauche (left: 0 au lieu de 100px)
- ✅ Hauteur augmentée : 25px → 40px sur mobile
- ✅ Padding et taille de police adaptés
- ✅ Taille minimale des boutons : 44px (conformément aux directives tactiles)
- ✅ `touchAction: manipulation` pour éviter le zoom sur double-tap

### 4. **Node.tsx**
- ✅ Connecteurs agrandis pour le tactile
  - Taille de base : 9px → 12px sur mobile
  - Zone de hit : 20px → 44px sur mobile (recommandation iOS/Android)
- ✅ Détection automatique de la taille d'écran
- ✅ `touchAction: manipulation` sur les connecteurs

### 5. **Canvas principal (index.tsx)**
- ✅ **Pinch-to-zoom** implémenté pour mobile
  - Gestion des événements `touchstart`, `touchmove`, `touchend`
  - Zoom centré sur le point de pincement
  - Limites de zoom : 0.5x - 3x
- ✅ Détection mobile avec resize listener
- ✅ Gestion des deux doigts pour le zoom
- ✅ Gestion d'un doigt pour le pan (déjà existant)

### 6. **CenterControl.tsx**
- ✅ Positionnement adaptatif
  - Desktop : `right: 32px, bottom: 50px`
  - Mobile : `right: 16px, bottom: 80px` (pour éviter le BinButton)
- ✅ Taille du bouton augmentée sur mobile (44px min height)
- ✅ Padding et font-size adaptés

### 7. **EditMenu (styles)**
- ✅ Largeur responsive : 30% → 95% sur mobile
- ✅ Largeur minimale : 280px sur mobile
- ✅ Bordures adaptées (top seulement sur mobile)
- ✅ Tabs avec taille minimale 44px sur mobile
- ✅ Inputs avec padding et taille augmentés
  - Font-size : 15px → 16px (évite le zoom auto iOS)
  - Min-height : 44px sur mobile

### 8. **SaveWorkflowModal.tsx**
- ✅ Largeur responsive : 480px max → 95% sur mobile
- ✅ Padding réduit sur mobile (16px au lieu de 24px)
- ✅ Inputs et textareas adaptés (44px min height)
- ✅ Boutons avec taille tactile appropriée

## Fonctionnalités tactiles ajoutées

### Pinch-to-zoom
```typescript
// Gestion du pinch avec deux doigts
- Détection de la distance entre deux doigts
- Calcul du centre du pincement
- Zoom centré sur le point de pincement
- Mise à jour fluide de l'échelle et de l'offset
```

### Touch-action
Tous les éléments interactifs utilisent `touchAction: 'manipulation'` pour :
- Éviter le double-tap zoom sur les boutons
- Améliorer la réactivité des interactions
- Réduire le délai de 300ms sur mobile

## Tailles minimales tactiles

Conformément aux directives d'accessibilité mobile :
- **Tous les boutons** : min-height de 44px sur mobile
- **Connecteurs de nœuds** : zone de hit de 44px sur mobile
- **Inputs de formulaire** : min-height de 44px sur mobile
- **Font-size des inputs** : 16px minimum (évite le zoom auto iOS)

## Media Queries dynamiques

Au lieu d'utiliser CSS media queries, la détection se fait en JavaScript :
```typescript
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth <= 768);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

Avantages :
- Réactivité immédiate au changement d'orientation
- Styles conditionnels faciles à gérer
- Cohérence entre tous les composants

## Tests recommandés

1. **Orientation**
   - ✓ Portrait
   - ✓ Paysage

2. **Gestes tactiles**
   - ✓ Pinch-to-zoom (deux doigts)
   - ✓ Pan (un doigt)
   - ✓ Tap sur nœuds
   - ✓ Tap sur connecteurs
   - ✓ Drag & drop de nœuds

3. **Tailles d'écran**
   - ✓ < 768px (mobile)
   - ✓ ≥ 768px (tablette/desktop)

4. **Plateformes**
   - iOS Safari
   - Android Chrome
   - Navigateur web responsive

## Améliorations futures possibles

- [ ] Ajouter des vibrations haptiques lors du drag & drop
- [ ] Implémenter un menu hamburger condensé sur très petits écrans (<400px)
- [ ] Ajouter des animations de transition plus fluides sur mobile
- [ ] Optimiser les performances pour les anciens appareils
- [ ] Ajouter des gestes supplémentaires (rotation à deux doigts, etc.)
