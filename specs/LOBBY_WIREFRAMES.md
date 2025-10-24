# ShootWaste Multiplayer Lobby System - Wireframes & UI/UX Specifications

## 📱 **Main Menu Screen**

```
╔══════════════════════════════════════════════════════════════╗
║                         ShootWaste                           ║
║                                                              ║
║          Select Language / Selecteer taal / 选择语言          ║
║                                                              ║
║    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        ║
║    │   English   │  │ Nederlands  │  │     中文     │        ║
║    └─────────────┘  └─────────────┘  └─────────────┘        ║
║                                                              ║
║ ────────────────────────────────────────────────────────────  ║
║                        Game Mode                             ║
║                                                              ║
║              ┌─────────────────────────────┐                 ║
║              │    🎮 Multiplayer Game      │                 ║
║              └─────────────────────────────┘                 ║
║                                                              ║
║              ┌─────────────────────────────┐                 ║
║              │    👤 Single Player         │                 ║
║              └─────────────────────────────┘                 ║
╚══════════════════════════════════════════════════════════════╝
```

### **Features:**
- **Language Selection**: Choose from English, Dutch, Chinese
- **Game Mode Selection**: Single Player or Multiplayer
- **Visual Hierarchy**: Clear separation between language and game mode
- **Responsive Design**: Adapts to mobile and desktop screens

---

## 🎮 **Multiplayer Lobby Screen**

```
╔══════════════════════════════════════════════════════════════╗
║                    Multiplayer Lobby                         ║
║                                                              ║
║ Your Nickname: [________________Enter your nickname_______]  ║
║                                                              ║
║ ┌──────────────────── Create Game ────────────────────────┐  ║
║ │                                                         │  ║
║ │ Game Mode: [Cooperative ▼]    Max Players: [4    ]     │  ║
║ │ Difficulty: [Normal ▼]                                 │  ║
║ │                                                         │  ║
║ │              ┌─────────────────┐                        │  ║
║ │              │   Create Game   │                        │  ║
║ │              └─────────────────┘                        │  ║
║ └─────────────────────────────────────────────────────────┘  ║
║                                                              ║
║ ┌──────────────────── Join Game ──────────────────────────┐  ║
║ │                                                         │  ║
║ │ ┌─────────────────────────────────────────────────────┐ │  ║
║ │ │ 🟢 Cooperative Game                                 │ │  ║
║ │ │ Players: 2/4 | Difficulty: Normal | Language: en   │ │  ║
║ │ │ ┌─────────────┐                                     │ │  ║
║ │ │ │ Join Game   │                                     │ │  ║
║ │ │ └─────────────┘                                     │ │  ║
║ │ └─────────────────────────────────────────────────────┘ │  ║
║ │                                                         │  ║
║ │              ┌─────────────────┐                        │  ║
║ │              │     Refresh     │                        │  ║
║ │              └─────────────────┘                        │  ║
║ └─────────────────────────────────────────────────────────┘  ║
║                                                              ║
║              ┌─────────────────────────────┐                 ║
║              │    Back to Main Menu        │                 ║
║              └─────────────────────────────┘                 ║
╚══════════════════════════════════════════════════════════════╝
```

### **UI Components:**

#### **1. Nickname Input**
- **Type**: Text input field
- **Validation**: 1-20 characters, no special characters
- **Required**: Yes, shows alert if empty
- **Placeholder**: "Enter your nickname"

#### **2. Create Game Section**
- **Game Mode Dropdown**:
  - Cooperative (team-based)
  - Competitive (head-to-head)
- **Max Players Selector**: 2-4 players
- **Difficulty Dropdown**: Easy, Normal, Hard
- **Create Button**: Large, prominent, colored green

#### **3. Join Game Section**
- **Game List**: Auto-refreshing list of available games
- **Game Cards**: Show mode, player count, difficulty, language
- **Join Buttons**: Individual for each game
- **Refresh Button**: Manual refresh option

---

## 👥 **Current Lobby Screen (In-Game Lobby)**

```
╔══════════════════════════════════════════════════════════════╗
║                      Current Lobby                           ║
║                                                              ║
║ Mode: Cooperative                                            ║
║ Difficulty: Normal                                           ║
║                                                              ║
║ ┌──────────────── Players in Lobby: ─────────────────────┐   ║
║ │                                                        │   ║
║ │ 🟢 PlayerOne 👑 (You)                                  │   ║
║ │ 🟢 PlayerTwo                                           │   ║
║ │ 🔴 PlayerThree (Disconnected)                          │   ║
║ │ ⚪ Waiting for player...                               │   ║
║ │                                                        │   ║
║ └────────────────────────────────────────────────────────┘   ║
║                                                              ║
║ ┌─────────────────┐    ┌─────────────────┐                  ║
║ │   Start Game    │    │  Leave Lobby    │                  ║
║ │   (Host Only)   │    │                 │                  ║
║ └─────────────────┘    └─────────────────┘                  ║
║                                                              ║
║ Status: Players: 3/4 | Status: waiting                      ║
╚══════════════════════════════════════════════════════════════╝
```

### **Player Status Indicators:**
- **🟢 Green Circle**: Connected and ready
- **🔴 Red Circle**: Disconnected
- **⚪ White Circle**: Waiting for player slot
- **👑 Crown**: Host player
- **(You)**: Current player indicator

### **Host Controls:**
- **Start Game Button**: Only visible to host, requires minimum 2 players
- **Kick Player**: (Future feature) Remove problematic players

### **Real-time Updates:**
- Player connections/disconnections
- Nickname changes
- Game settings modifications

---

## 🎯 **In-Game Multiplayer UI**

```
╔══════════════════════════════════════════════════════════════╗
║ ┌─────────── Multiplayer Info ──────────┐                    ║
║ │ Players:                              │                    ║
║ │ 🟢 PlayerOne: ❤️❤️❤️ (3 lives)        │                    ║
║ │ 🟢 PlayerTwo: ❤️❤️ (2 lives)          │                    ║
║ │                                       │     GAME AREA     ║
║ │ Team Score: 1,250                     │                    ║
║ │                                       │                    ║
║ │ 🟢 Connected                          │                    ║
║ └───────────────────────────────────────┘                    ║
║                                                              ║
║                                                              ║
║                         [Game Canvas]                        ║
║                                                              ║
║                                                              ║
║                                                              ║
║ Target: PMD                            Timer: 25s            ║
║ ══════════════════════════════════════════════════════════    ║
║               [Weapon Heat Bar]                              ║
╚══════════════════════════════════════════════════════════════╝
```

### **Multiplayer Game Elements:**

#### **1. Player Status Panel**
- **Position**: Top-left overlay
- **Background**: Semi-transparent dark
- **Information**: Player names, lives, connection status
- **Updates**: Real-time sync every 100ms

#### **2. Team Score Display**
- **Shared Score**: All players contribute to single team score
- **Large Font**: Prominent display
- **Color**: Yellow/gold for visibility

#### **3. Connection Indicator**
- **Green**: Stable connection
- **Yellow**: Lag detected
- **Red**: Connection issues
- **Auto-hide**: Disappears when connection is stable

#### **4. Player Ships**
- **Different Colors**: Each player has unique ship color
- **Name Labels**: Optional floating nicknames
- **Transparency**: Remote players slightly transparent

---

## 📱 **Mobile Responsive Design**

### **Mobile Lobby (Portrait)**
```
┌─────────────────────────┐
│    Multiplayer Lobby    │
├─────────────────────────┤
│ Nickname: [___________] │
│                         │
│ ┌───── Create Game ───┐ │
│ │ Mode: [Coop ▼]      │ │
│ │ Players: [4]        │ │
│ │ Diff: [Normal ▼]    │ │
│ │ ┌─────────────────┐ │ │
│ │ │  Create Game    │ │ │
│ │ └─────────────────┘ │ │
│ └─────────────────────┘ │
│                         │
│ ┌───── Join Game ────┐  │
│ │ 🟢 Coop Game       │  │
│ │ 2/4 | Normal | en  │  │
│ │ ┌─────────────────┐ │  │
│ │ │   Join Game     │ │  │
│ │ └─────────────────┘ │  │
│ └─────────────────────┘  │
│                         │
│ ┌─────────────────────┐  │
│ │   Back to Menu      │  │
│ └─────────────────────┘  │
└─────────────────────────┘
```

### **Mobile Optimizations:**
- **Larger Touch Targets**: Minimum 44px height
- **Simplified Layout**: Vertical stacking
- **Reduced Text**: Shortened labels
- **Swipe Gestures**: Horizontal scroll for game list
- **Auto-scroll**: Keep active elements in view

---

## 🎨 **Color Scheme & Styling**

### **Primary Colors**
- **Background**: Dark blue gradient (#0f0f23 to #1a1a3e)
- **Primary Accent**: Cyan (#00ffff)
- **Secondary Accent**: Orange (#ff6600)
- **Success**: Green (#00ff00)
- **Warning**: Yellow (#ffff00)
- **Error**: Red (#ff0000)

### **Typography**
- **Font Family**: 'Courier New', monospace
- **Headers**: 24-36px, bold
- **Body Text**: 16-18px, normal
- **Small Text**: 12-14px, for status info

### **Interactive Elements**
- **Buttons**: Gradient backgrounds, hover effects
- **Inputs**: Cyan borders, dark backgrounds
- **Cards**: Semi-transparent overlays with cyan borders
- **Animations**: Smooth transitions (0.3s ease)

---

## 🔄 **User Flow Diagrams**

### **Multiplayer Flow**
```
Start → Language Select → Game Mode Choice → Multiplayer Lobby
                                              ↓
Create Game ← → Join Game → Current Lobby → Game Start → Gameplay
     ↓              ↓            ↓              ↓
  Host Lobby    Join Success   Wait for Host   Team Play
     ↓              ↓            ↓              ↓
  Start Game    Current Lobby   Game Start     Game End
```

### **Error Handling Flow**
```
Action Attempt → Validation → Success/Error
                     ↓             ↓
                Error Alert → Retry Option
                     ↓             ↓
               User Feedback → Back to Lobby
```

---

## 🧪 **Interactive Prototypes**

### **State Management**
- **Lobby States**: Empty, Waiting, Full, Starting, Active
- **Player States**: Connected, Disconnected, Playing, Spectating
- **Game States**: Waiting, Active, Paused, Finished

### **Real-time Features**
- **Auto-refresh**: Game list updates every 5 seconds
- **Live Updates**: Player status changes instantly
- **Reconnection**: Automatic retry on connection loss
- **Timeout Handling**: 30-second timeout for actions

### **Accessibility Features**
- **Keyboard Navigation**: Tab order for all interactive elements
- **Screen Reader Support**: ARIA labels and descriptions
- **High Contrast**: Optional high contrast color scheme
- **Font Scaling**: Respects system font size settings

---

## 📊 **Performance Specifications**

### **Load Times**
- **Lobby Load**: < 2 seconds
- **Game Join**: < 3 seconds
- **Game Start**: < 5 seconds

### **Network Requirements**
- **Minimum Bandwidth**: 1 Mbps
- **Recommended**: 5 Mbps for optimal experience
- **Latency Tolerance**: < 200ms acceptable, < 100ms optimal

### **Device Compatibility**
- **Desktop**: All modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile**: iOS 12+, Android 8+
- **Tablet**: iPad OS 13+, Android tablets

---

This comprehensive wireframe and specification document provides a complete blueprint for implementing the multiplayer lobby system with detailed visual layouts, user flows, and technical requirements.