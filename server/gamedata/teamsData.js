const INITIAL_TEAMS = [
  {
    id: 'real_madrid',
    name: 'Real Madrid',
    logo: '👑',
    squad: [
      { id: 'courtois', name: 'Thibaut Courtois', pos: 'GK', ovr: 89, stats: { div: 85, han: 89, kic: 76, ref: 90, spd: 46, pos: 88 } },
      { id: 'trent', name: 'Trent Alexander-Arnold', pos: 'RB', ovr: 86, stats: { pac: 76, sho: 72, pas: 89, dri: 80, def: 80, phy: 74 }, altPos: ['CM'] },
      { id: 'konate', name: 'Ibrahima Konate', pos: 'CB', ovr: 88, stats: { pac: 77, sho: 34, pas: 63, dri: 69, def: 86, phy: 85 } },
      { id: 'militao', name: 'Eder Militão', pos: 'CB', ovr: 85, stats: { pac: 82, sho: 50, pas: 69, dri: 71, def: 85, phy: 82 } },
      { id: 'cucurella', name: 'Marc Cucurella', pos: 'LB', ovr: 84, stats: { pac: 75, sho: 64, pas: 79, dri: 80, def: 82, phy: 79 } },
      { id: 'tchouameni', name: 'Aurélien Tchouaméni', pos: 'CDM', ovr: 84, stats: { pac: 71, sho: 69, pas: 79, dri: 78, def: 81, phy: 82 }, altPos: ['CB'] },
      { id: 'valverde', name: 'Federico Valverde', pos: 'CM', ovr: 89, stats: { pac: 88, sho: 84, pas: 84, dri: 84, def: 83, phy: 85 }, altPos: ['RB', 'RW'] },
      { id: 'bellingham', name: 'Jude Bellingham', pos: 'CAM', ovr: 90, stats: { pac: 80, sho: 86, pas: 83, dri: 90, def: 78, phy: 85 }, altPos: ['CM'] },
      { id: 'rodrygo', name: 'Rodrygo', pos: 'RW', ovr: 85, stats: { pac: 88, sho: 80, pas: 79, dri: 87, def: 31, phy: 64 }, altPos: ['LW', 'ST'] },
      { id: 'vinicius', name: 'Vinícius Júnior', pos: 'LW', ovr: 89, stats: { pac: 95, sho: 84, pas: 81, dri: 91, def: 29, phy: 69 }, altPos: ['RW'] },
      { id: 'mbappe', name: 'Kylian Mbappé', pos: 'ST', ovr: 91, stats: { pac: 97, sho: 90, pas: 81, dri: 92, def: 37, phy: 76 } },

      { id: 'lunin', name: 'Andriy Lunin', pos: "GK" , stats: { div: 80, han: 78, kic: 79, ref: 81, spd: 35, pos: 80 } },
      { id: 'rudiger', name: 'Antonio Rudiger', pos: 'CB', ovr: 85, stats: { pac: 79, sho: 55, pas: 72, dri: 70, def: 84, phy: 86 } },
      { id: 'camavinga', name: 'Eduardo Camavinga', pos: 'CM', ovr: 83, stats: { pac: 80, sho: 68, pas: 81, dri: 84, def: 78, phy: 80 }, altPos: ['LB', 'CDM'] },
      { id: 'guler', name: 'Arda Güler', pos: 'CAM', ovr: 81, stats: { pac: 70, sho: 77, pas: 83, dri: 83, def: 52, phy: 50 }, altPos: ['RW'] },
      { id: 'endrick', name: 'Endrick', pos: 'ST', ovr: 77, stats: { pac: 87, sho: 77, pas: 62, dri: 78, def: 30, phy: 68 } },
      { id: 'huijsen', name: 'Dean Huijsen', pos: 'CB', ovr: 82, stats: { pac: 71, sho: 55, pas: 73, dri: 74, def: 82, phy: 76 } },
      { id: 'bernardo', name: 'Bernardo Silva', pos: 'CM', ovr: 84, stats: { pac: 61, sho: 78, pas: 83, dri: 89, def: 71, phy: 65 } },
      { id: 'diomande', name: 'Yan Diomande', pos: 'LM', ovr: 75, stats: { pac: 77, sho: 70, pas: 65, dri: 84, def: 28, phy: 50 } },
      { id: 'dumfries', name: 'Denzel Dumfries', pos: 'RB', ovr: 84, stats: { pac: 84, sho: 70, pas: 75, dri: 79, def: 79, phy: 84 }, altPos: ['RW'] }
    ]
  },
  {
    id: 'barcelona',
    name: 'FC Barcelona',
    logo: '🔵🔴',
    squad: [
      { id: 'joan_garcia', name: 'Joan García', pos: 'GK', ovr: 83, stats: { div: 81, han: 82, kic: 77, ref: 86, spd: 46, pos: 83 } },
      { id: 'kounde', name: 'Jules Koundé', pos: 'RB', ovr: 87, stats: { pac: 84, sho: 47, pas: 74, dri: 79, def: 86, phy: 84 }, altPos: ['CB'] },
      { id: 'araujo', name: 'Ronald Araújo', pos: 'CB', ovr: 83, stats: { pac: 80, sho: 53, pas: 63, dri: 61, def: 81, phy: 83 } },
      { id: 'cubarsi', name: 'Pau Cubarsí', pos: 'CB', ovr: 82, stats: { pac: 70, sho: 42, pas: 66, dri: 77, def: 84, phy: 76 } },
      { id: 'balde', name: 'Alejandro Balde', pos: 'LB', ovr: 83, stats: { pac: 91, sho: 50, pas: 75, dri: 79, def: 78, phy: 67 } },
      { id: 'de_jong', name: 'Frenkie de Jong', pos: 'CM', ovr: 87, stats: { pac: 82, sho: 71, pas: 85, dri: 87, def: 78, phy: 77 }, altPos: ['CB', 'CDM'] },
      { id: 'pedri', name: 'Pedri', pos: 'CM', ovr: 89, stats: { pac: 77, sho: 73, pas: 85, dri: 91, def: 78, phy: 77 }, altPos: ['CAM'] },
      { id: 'olmo', name: 'Dani Olmo', pos: 'CAM', ovr: 85, stats: { pac: 73, sho: 79, pas: 83, dri: 87, def: 50, phy: 56 }, altPos: ['RW', 'CM'] },
      { id: 'yamal', name: 'Lamine Yamal', pos: 'RM', ovr: 89, stats: { pac: 85, sho: 81, pas: 86, dri: 90, def: 23, phy: 53 }, altPos: ['RW'] },
      { id: 'raphinha', name: 'Raphinha', pos: 'LM', ovr: 89, stats: { pac: 91, sho: 84, pas: 85, dri: 87, def: 53, phy: 75 }, altPos: ['LW'] },
      { id: 'lewandowski', name: 'Robert Lewandowski', pos: 'ST', ovr: 88, stats: { pac: 74, sho: 89, pas: 79, dri: 85, def: 44, phy: 84 } },

      { id: 'szczesny', name: 'Wojciech Szczęsny', pos: 'GK', ovr: 84, stats: { div: 82, han: 83, kic: 75, ref: 84, spd: 48, pos: 84 } },
      { id: 'gordon', name: 'Anthony Gordon', pos: 'LW', ovr: 83, stats: { pac: 91, sho: 79, pas: 78, dri: 83, def: 50, phy: 71 } },
      { id: 'gavi', name: 'Gavi', pos: 'CM', ovr: 83, stats: { pac: 76, sho: 66, pas: 78, dri: 85, def: 68, phy: 70 }, altPos: ['CDM'] },
      { id: 'ferran_torres', name: 'Ferran Torres', pos: 'LW', ovr: 83, stats: { pac: 83, sho: 81, pas: 79, dri: 83, def: 35, phy: 68 } },
      { id: 'adeyemi', name: 'Karim Adeyemi', pos: 'RM', ovr: 81, stats: { pac: 96, sho: 76, pas: 72, dri: 82, def: 36, phy: 69 } },
      { id: 'fermin', name: 'Fermín López', pos: 'CAM', ovr: 80, stats: { pac: 74, sho: 75, pas: 75, dri: 82, def: 62, phy: 55 }, altPos: ['CM'] },
      { id: 'christensen', name: 'Andreas Christensen', pos: 'CB', ovr: 80, stats: { pac: 64, sho: 32, pas: 67, dri: 70, def: 81, phy: 74 } },
      { id: 'casado', name: 'Marc Casadó', pos: 'CDM', ovr: 79, stats: { pac: 57, sho: 64, pas: 72, dri: 80, def: 77, phy: 62 } },
      { id: 'eric_garcia', name: 'Eric García', pos: 'CB', ovr: 79, stats: { pac: 63, sho: 48, pas: 70, dri: 71, def: 80, phy: 73 } }
    ]
  },
  {
    id: 'manchester_city',
    name: 'Manchester City',
    logo: '💙',
    squad: [
      { id: 'donnarumma', name: 'Gianluigi Donnarumma', pos: 'GK', ovr: 89, stats: { div: 90, han: 83, kic: 70, ref: 90, spd: 52, pos: 87 } },
      { id: 'matheus_nunes', name: 'Matheus Nunes', pos: 'RB', ovr: 79, stats: { pac: 85, sho: 70, pas: 76, dri: 79, def: 73, phy: 76 }, altPos: ['CM', 'LB'] },
      { id: 'ruben_dias', name: 'Rúben Dias', pos: 'CB', ovr: 86, stats: { pac: 59, sho: 39, pas: 69, dri: 69, def: 86, phy: 84 } },
      { id: 'khusanov', name: 'Abdukodir Khusanov', pos: 'CB', ovr: 82, stats: { pac: 88, sho: 50, pas: 70, dri: 64, def: 85, phy: 86 } },
      { id: 'gvardiol', name: 'Joško Gvardiol', pos: 'LB', ovr: 84, stats: { pac: 78, sho: 71, pas: 75, dri: 78, def: 84, phy: 82 } },
      { id: 'rodri', name: 'Rodri', pos: 'CDM', ovr: 90, stats: { pac: 65, sho: 80, pas: 86, dri: 84, def: 86, phy: 85 }, altPos: ['CB'] },
      { id: 'reijnders', name: 'Tijjani Reijnders', pos: 'CM', ovr: 86, stats: { pac: 79, sho: 79, pas: 82, dri: 85, def: 77, phy: 77 }, altPos: ['CAM'] },
      { id: 'foden', name: 'Phil Foden', pos: 'RW', ovr: 85, stats: { pac: 81, sho: 81, pas: 82, dri: 89, def: 57, phy: 57 }, altPos: ['CAM', 'LW'] },
      { id: 'echeverri', name: 'Claudio Echeverri', pos: 'RM', ovr: 80, stats: { pac: 78, sho: 76, pas: 80, dri: 85, def: 38, phy: 60 } },
      { id: 'doku', name: 'Jérémy Doku', pos: 'LW', ovr: 80, stats: { pac: 91, sho: 71, pas: 72, dri: 87, def: 32, phy: 68 }, altPos: ['RW'] },
      { id: 'haaland', name: 'Erling Haaland', pos: 'ST', ovr: 90, stats: { pac: 86, sho: 91, pas: 70, dri: 80, def: 45, phy: 88 } },

      { id: 'marmoush', name: 'Omar Marmoush', pos: 'ST', ovr: 84, stats: { pac: 89, sho: 85, pas: 76, dri: 86, def: 34, phy: 71 } },
      { id: 'detourbet', name: 'Mathys Detourbet', pos: 'RW', ovr: 74, stats: { pac: 88, sho: 72, pas: 68, dri: 80, def: 28, phy: 62 } },
      { id: 'oreilly_n', name: "Nico O'Reilly", pos: 'CB', ovr: 76, stats: { pac: 74, sho: 45, pas: 74, dri: 71, def: 76, phy: 70 } },
      { id: 'monga', name: 'Jeremy Monga', pos: 'RW', ovr: 73, stats: { pac: 85, sho: 70, pas: 66, dri: 79, def: 25, phy: 58 } },
      { id: 'cherki', name: 'Rayan Cherki', pos: 'RW', ovr: 81, stats: { pac: 75, sho: 75, pas: 80, dri: 88, def: 21, phy: 65 } },
      { id: 'ait_nouri', name: 'Rayan Aït-Nouri', pos: 'LB', ovr: 81, stats: { pac: 84, sho: 53, pas: 76, dri: 84, def: 77, phy: 70 } },
      { id: 'anderson', name: 'Elliot Anderson', pos: 'CDM', ovr: 80, stats: { pac: 71, sho: 68, pas: 79, dri: 81, def: 77, phy: 78 } },
      { id: 'ortega', name: 'Stefan Ortega', pos: 'GK', ovr: 79, stats: { div: 78, han: 77, kic: 85, ref: 81, spd: 52, pos: 78 } },
      { id: 'vitor_reis', name: 'Vitor Reis', pos: 'CB', ovr: 75, stats: { pac: 65, sho: 34, pas: 55, dri: 65, def: 71, phy: 68 } }
    ]
  },
  {
    id: 'liverpool',
    name: 'Liverpool FC',
    logo: '🦅',
    squad: [
      { id: 'allison', name: 'Allison Becker', pos: 'GK', ovr: 89, stats: { div: 86, han: 85, kic: 86, ref: 89, spd: 49, pos: 90 } },
      { id: 'frimpong', name: 'Jeremi Frimpong', pos: 'RB', ovr: 83, stats: { pac: 94, sho: 62, pas: 74, dri: 84, def: 72, phy: 63 }, altPos: ['RW'] },
      { id: 'jacquet', name: 'Jeremy Jacquet', pos: 'CB', ovr: 80, stats: { pac: 70, sho: 39, pas: 65, dri: 63, def: 84, phy: 82 } },
      { id: 'van-djik', name: 'Virgil Van Djik', pos: 'CB', ovr: 90, stats: { pac: 73, sho: 60, pas: 72, dri: 72, def: 90, phy: 87 } },
      { id: 'robertson', name: 'Andrew Robertson', pos: 'LB', ovr: 82, stats: { pac: 74, sho: 61, pas: 80, dri: 77, def: 79, phy: 75 } },
      { id: 'gravenberch', name: 'Ryan Gravenberch', pos: 'CDM', ovr: 85, stats: { pac: 76, sho: 76, pas: 81, dri: 85, def: 81, phy: 81 }, altPos: ['CB', 'CM'] },
      { id: 'mac-allister', name: 'Alexis Max Allister', pos: 'CM', ovr: 87, stats: { pac: 66, sho: 82, pas: 85, dri: 85, def: 78, phy: 76 }, altPos: ['CAM', 'RB'] },
      { id: 'wirtz', name: 'Florian Wirtz', pos: 'CAM', ovr: 89, stats: { pac: 80, sho: 82, pas: 88, dri: 90, def: 54, phy: 67 }, altPos: ['LW', 'RW'] },
      { id: 'salah', name: 'Mohammed Salah', pos: 'RW', ovr: 91, stats: { pac: 89, sho: 88, pas: 86, dri: 90, def: 45, phy: 76 }, altPos: ['ST'] },
      { id: 'gakpo', name: 'Cody Gakpo', pos: 'LW', ovr: 84, stats: { pac: 83, sho: 82, pas: 80, dri: 83, def: 47, phy: 74 }, altPos: ['ST', 'RW'] },
      { id: 'isak', name: 'Alexander Isak', pos: 'ST', ovr: 88, stats: { pac: 83, sho: 89, pas: 73, dri: 85, def: 39, phy: 76 } },

      { id: 'szoboszlai', name: 'Dominik Szoboszlai', pos: 'CAM', ovr: 87, stats: { pac: 85, sho: 89, pas: 84, dri: 83, def: 67, phy: 76 }, altPos: ['RM', 'RB'] },
      { id: 'chiesa', name: 'Federico Chiesa', pos: 'RW', ovr: 81, stats: { pac: 87, sho: 80, pas: 75, dri: 83, def: 44, phy: 68 } },
      { id: 'ekitike', name: 'Hugo Ekitike', pos: 'ST', ovr: 84, stats: { pac: 86, sho: 82, pas: 73, dri: 85, def: 33, phy: 73 } },
      { id: 'munoz', name: 'Victor Munoz', pos: 'LW', ovr: 75, stats: { pac: 83, sho: 71, pas: 70, dri: 78, def: 30, phy: 53 } },
      { id: 'curtis', name: 'Curtis Jones', pos: 'CM', ovr: 80, stats: { pac: 74, sho: 75, pas: 76, dri: 82, def: 72, phy: 76 } },
      { id: 'kerkez', name: 'Milos Kerkez', pos: 'LB', ovr: 82, stats: { pac: 87, sho: 59, pas: 75, dri: 78, def: 77, phy: 80 } },
      { id: 'endo', name: 'Wataru Endo', pos: 'CDM', ovr: 79, stats: { pac: 74, sho: 29, pas: 71, dri: 77, def: 79, phy: 73 } },
      { id: 'mamardashvili', name: 'Giorgi Mamardashvili', pos: 'GK', ovr: 84, stats: { div: 84, han: 81, kic: 72, ref: 84, spd: 48, pos: 84 } },
      { id: 'bradley', name: 'Conor Bradley', pos: 'RB', ovr: 78, stats: { pac: 80, sho: 61, pas: 70, dri: 75, def: 75, phy: 74 } }
    ]
  },
  {
    id: 'bayern-munchen',
    name: 'FC Bayern Munich',
    logo: '🛡️',
    squad: [
      { id: 'neuer', name: 'Neuer', pos: 'GK', ovr: 84, stats: { div: 81, han: 81, kic: 90, ref: 81, spd: 35, pos: 86 } },
      { id: 'laimer', name: 'Konrad Laimer', pos: 'RB', ovr: 82, stats: { pac: 82, sho: 69, pas: 76, dri: 75, def: 81, phy: 76 }, altPos: ['CDM', 'CM'] },
      { id: 'upamecano', name: 'Dayot Upamecano', pos: 'CB', ovr: 87, stats: { pac: 77, sho: 45, pas: 70, dri: 73, def: 88, phy: 86 } },
      { id: 'tah', name: 'Jonatan Tah', pos: 'CB', ovr: 87, stats: { pac: 63, sho: 38, pas: 60, dri: 63, def: 87, phy: 89 } },
      { id: 'davies', name: 'Alphonso Davies', pos: 'LB', ovr: 84, stats: { pac: 94, sho: 66, pas: 78, dri: 85, def: 74, phy: 76 } },
      { id: 'kimmich', name: 'Joshua Kimmich', pos: 'CDM', ovr: 89, stats: { pac: 72, sho: 74, pas: 89, dri: 84, def: 83, phy: 79 }, altPos: ['RB', 'CM'] },
      { id: 'goretzka', name: 'Leon Goretzka', pos: 'CM', ovr: 82, stats: { pac: 77, sho: 78, pas: 80, dri: 80, def: 80, phy: 82 }, altPos: ['CDM'] },
      { id: 'musiala', name: 'Jamal Musiala', pos: 'CAM', ovr: 88, stats: { pac: 80, sho: 82, pas: 80, dri: 90, def: 66, phy: 65 }, altPos: ['LW', 'RW'] },
      { id: 'olise', name: 'Olise ', pos: 'RW', ovr: 88, stats: { pac: 78, sho: 82, pas: 86, dri: 90, def: 50, phy: 70 }, altPos: ['LW', 'CAM'] },
      { id: 'diaz', name: 'Luis Diaz', pos: 'LW', ovr: 85, stats: { pac: 88, sho: 81, pas: 76, dri: 87, def: 45, phy: 75 }, altPos: ['RW'] },
      { id: 'kane', name: 'Harry Kane', pos: 'ST', ovr: 89, stats: { pac: 64, sho: 92, pas: 83, dri: 82, def: 48, phy: 82 } },

      { id: 'karl', name: 'Lennart Karl', pos: 'CAM', ovr: 73, stats: { pac: 73, sho: 62, pas: 65, dri: 72, def: 35, phy: 40 } },
      { id: 'kim', name: 'Kim Min Jae', pos: 'CB', ovr: 82, stats: { pac: 79, sho: 83, pas: 78, dri: 84, def: 43, phy: 66 } },
      { id: 'jackson', name: 'Nicolas Jackson', pos: 'ST', ovr: 80, stats: { pac: 82, sho: 77, pas: 69, dri: 79, def: 40, phy: 77 } },
      { id: 'gnabry', name: 'Serge Gnabry', pos: 'LW', ovr: 82, stats: { pac: 79, sho: 83, pas: 78, dri: 84, def: 43, phy: 66 } },
      { id: 'tom', name: 'Tom Bischof', pos: 'CM', ovr: 76, stats: { pac: 58, sho: 67, pas: 79, dri: 79, def: 60, phy: 60 } },
      { id: 'guerreiro', name: 'Raphael Guerreiro', pos: 'LB', ovr: 80, stats: { pac: 69, sho: 78, pas: 85, dri: 88, def: 74, phy: 54 } },
      { id: 'pavlovic', name: 'Aleskandar Pavlovic', pos: 'CDM', ovr: 79, stats: { pac: 62, sho: 64, pas: 79, dri: 78, def: 76, phy: 71 } },
      { id: 'urbig', name: 'Jonas Urbig', pos: 'GK', ovr: 74, stats: { div: 74, han: 70, kic: 79, ref: 76, spd: 32, pos: 74 } },
      { id: 'boey', name: 'Sacha Boey', pos: 'RB', ovr: 77, stats: { pac: 71, sho: 55, pas: 66, dri: 75, def: 76, phy: 77 } }
    ]
  },
  {
    id: 'arsenal',
    name: 'Arsenal FC',
    logo: '🔴⚪',
    squad: [
      { id: 'raya', name: 'David Raya', pos: 'GK', ovr: 87, stats: { div: 89, han: 81, kic: 77, ref: 86, spd: 41, pos: 89 } },
      { id: 'timber', name: 'Jurriën Timber', pos: 'RB', ovr: 84, stats: { pac: 91, sho: 55, pas: 79, dri: 76, def: 79, phy: 78 } },
      { id: 'saliba', name: 'William Saliba', pos: 'CB', ovr: 88, stats: { pac: 74, sho: 54, pas: 82, dri: 75, def: 89, phy: 91 } },
      { id: 'gabriel', name: 'Gabriel Magalhães', pos: 'CB', ovr: 86, stats: { pac: 82, sho: 50, pas: 82, dri: 74, def: 88, phy: 84 } },
      { id: 'calafiori', name: 'Riccardo Calafiori', pos: 'LB', ovr: 83, stats: { pac: 90, sho: 57, pas: 74, dri: 76, def: 85, phy: 78 } },
      { id: 'rice', name: 'Declan Rice', pos: 'CDM', ovr: 87, stats: { pac: 81, sho: 76, pas: 85, dri: 87, def: 90, phy: 90 } },
      { id: 'odegaard', name: 'Martin Ødegaard', pos: 'CAM', ovr: 88, stats: { pac: 88, sho: 87, pas: 95, dri: 95, def: 66, phy: 75 } },
      { id: 'merino', name: 'Mikel Merino', pos: 'CM', ovr: 82, stats: { pac: 73, sho: 71, pas: 81, dri: 79, def: 69, phy: 77 } },
      { id: 'saka', name: 'Bukayo Saka', pos: 'RW', ovr: 89, stats: { pac: 95, sho: 85, pas: 83, dri: 92, def: 54, phy: 84 } },
      { id: 'martinelli', name: 'Gabriel Martinelli', pos: 'LW', ovr: 84, stats: { pac: 94, sho: 83, pas: 76, dri: 93, def: 48, phy: 73 } },
      { id: 'gyokeres', name: 'Viktor Gyökeres', pos: 'ST', ovr: 86, stats: { pac: 95, sho: 94, pas: 79, dri: 90, def: 60, phy: 85 } },

      { id: 'kepa', name: 'Kepa Arrizabalaga', pos: 'GK', ovr: 79, stats: { div: 77, han: 73, kic: 69, ref: 79, spd: 32, pos: 83 } },
      { id: 'white', name: 'Ben White', pos: 'RB', ovr: 82, stats: { pac: 89, sho: 56, pas: 80, dri: 79, def: 85, phy: 76 } },
      { id: 'kiwior', name: 'Jakub Kiwior', pos: 'CB', ovr: 79, stats: { pac: 68, sho: 46, pas: 72, dri: 62, def: 84, phy: 86 } },
      { id: 'lewis-skelly', name: 'Myles Lewis-Skelly', pos: 'LB', ovr: 78, stats: { pac: 79, sho: 51, pas: 80, dri: 76, def: 71, phy: 67 } },
      { id: 'havertz', name: 'Kai Havertz', pos: 'ST', ovr: 83, stats: { pac: 81, sho: 91, pas: 79, dri: 84, def: 48, phy: 78 } },
      { id: 'trossard', name: 'Leandro Trossard', pos: 'LW', ovr: 81, stats: { pac: 95, sho: 79, pas: 83, dri: 91, def: 43, phy: 74 } },
      { id: 'jesus_a', name: 'Gabriel Jesus', pos: 'ST', ovr: 80, stats: { pac: 85, sho: 86, pas: 69, dri: 84, def: 45, phy: 75 } },
      { id: 'jorginho', name: 'Jorginho', pos: 'CDM', ovr: 78, stats: { pac: 67, sho: 69, pas: 81, dri: 69, def: 82, phy: 76 } },
      { id: 'nwaneri', name: 'Ethan Nwaneri', pos: 'CAM', ovr: 76, stats: { pac: 77, sho: 78, pas: 80, dri: 84, def: 53, phy: 64 } }
    ]
  },
  {
    id: 'man_utd',
    name: 'Manchester United',
    logo: '👹',
    squad: [
      { id: 'bayindir', name: 'Altay Bayındır', pos: 'GK', ovr: 80, stats: { div: 84, han: 79, kic: 75, ref: 82, spd: 30, pos: 78 } },
      { id: 'dalot', name: 'Diogo Dalot', pos: 'RB', ovr: 80, stats: { pac: 76, sho: 61, pas: 81, dri: 82, def: 76, phy: 69 } },
      { id: 'martinez_l', name: 'Lisandro Martínez', pos: 'CB', ovr: 83, stats: { pac: 80, sho: 58, pas: 70, dri: 69, def: 82, phy: 88 } },
      { id: 'deligt', name: 'Matthijs de Ligt', pos: 'CB', ovr: 83, stats: { pac: 78, sho: 49, pas: 75, dri: 70, def: 84, phy: 89 } },
      { id: 'dorgu', name: 'Patrick Dorgu', pos: 'LB', ovr: 78, stats: { pac: 79, sho: 51, pas: 74, dri: 79, def: 72, phy: 70 } },
      { id: 'casemiro', name: 'Casemiro', pos: 'CDM', ovr: 81, stats: { pac: 77, sho: 69, pas: 78, dri: 75, def: 80, phy: 80 } },
      { id: 'fernandes', name: 'Bruno Fernandes', pos: 'CM', ovr: 88, stats: { pac: 80, sho: 81, pas: 89, dri: 85, def: 75, phy: 88 } },
      { id: 'mainoo', name: 'Kobbie Mainoo', pos: 'CM', ovr: 81, stats: { pac: 72, sho: 78, pas: 89, dri: 76, def: 70, phy: 81 } },
      { id: 'amad', name: 'Amad Diallo', pos: 'RW', ovr: 81, stats: { pac: 86, sho: 75, pas: 82, dri: 88, def: 49, phy: 74 } },
      { id: 'garnacho', name: 'Alejandro Garnacho', pos: 'LW', ovr: 81, stats: { pac: 93, sho: 75, pas: 72, dri: 86, def: 48, phy: 71 } },
      { id: 'sesko', name: 'Benjamin Šeško', pos: 'ST', ovr: 82, stats: { pac: 88, sho: 90, pas: 80, dri: 79, def: 51, phy: 76 } },

      { id: 'heaton', name: 'Tom Heaton', pos: 'GK', ovr: 73, stats: { div: 78, han: 69, kic: 62, ref: 74, spd: 36, pos: 71 } },
      { id: 'maguire', name: 'Harry Maguire', pos: 'CB', ovr: 78, stats: { pac: 67, sho: 53, pas: 69, dri: 68, def: 83, phy: 75 } },
      { id: 'mazraoui', name: 'Noussair Mazraoui', pos: 'RB', ovr: 79, stats: { pac: 87, sho: 59, pas: 81, dri: 82, def: 81, phy: 69 } },
      { id: 'yoro', name: 'Leny Yoro', pos: 'CB', ovr: 80, stats: { pac: 72, sho: 47, pas: 71, dri: 61, def: 83, phy: 88 } },
      { id: 'ugarte', name: 'Manuel Ugarte', pos: 'CDM', ovr: 80, stats: { pac: 67, sho: 69, pas: 77, dri: 73, def: 89, phy: 88 } },
      { id: 'mount', name: 'Mason Mount', pos: 'CAM', ovr: 78, stats: { pac: 75, sho: 79, pas: 80, dri: 82, def: 60, phy: 71 } },
      { id: 'zirkzee', name: 'Joshua Zirkzee', pos: 'ST', ovr: 78, stats: { pac: 82, sho: 87, pas: 65, dri: 81, def: 48, phy: 78 } },
      { id: 'hojlund', name: 'Rasmus Højlund', pos: 'ST', ovr: 79, stats: { pac: 78, sho: 91, pas: 66, dri: 77, def: 50, phy: 77 } },
      { id: 'pellistri', name: 'Facundo Pellistri', pos: 'RW', ovr: 74, stats: { pac: 79, sho: 67, pas: 75, dri: 77, def: 43, phy: 65 } }
    ]
  },
  {
    id: 'aston_villa',
    name: 'Aston Villa',
    logo: '🦁',
    squad: [
      { id: 'martinez_e', name: 'Emiliano Martínez', pos: 'GK', ovr: 85, stats: { div: 85, han: 85, kic: 77, ref: 91, spd: 32, pos: 87 } },
      { id: 'cash', name: 'Matty Cash', pos: 'RB', ovr: 80, stats: { pac: 79, sho: 55, pas: 78, dri: 76, def: 76, phy: 77 } },
      { id: 'konsa', name: 'Ezri Konsa', pos: 'CB', ovr: 81, stats: { pac: 68, sho: 50, pas: 79, dri: 73, def: 80, phy: 80 } },
      { id: 'torres_p', name: 'Pau Torres', pos: 'CB', ovr: 82, stats: { pac: 71, sho: 57, pas: 79, dri: 73, def: 84, phy: 80 } },
      { id: 'digne', name: 'Lucas Digne', pos: 'LB', ovr: 79, stats: { pac: 85, sho: 57, pas: 76, dri: 83, def: 79, phy: 67 } },
      { id: 'kamara', name: 'Boubacar Kamara', pos: 'CDM', ovr: 82, stats: { pac: 76, sho: 66, pas: 82, dri: 81, def: 82, phy: 79 } },
      { id: 'tielemans', name: 'Youri Tielemans', pos: 'CM', ovr: 81, stats: { pac: 70, sho: 74, pas: 82, dri: 82, def: 76, phy: 75 } },
      { id: 'rogers', name: 'Morgan Rogers', pos: 'CAM', ovr: 83, stats: { pac: 81, sho: 78, pas: 89, dri: 94, def: 63, phy: 70 } },
      { id: 'buendia', name: 'Emiliano Buendía', pos: 'RW', ovr: 78, stats: { pac: 85, sho: 73, pas: 68, dri: 87, def: 48, phy: 65 } },
      { id: 'bailey', name: 'Leon Bailey', pos: 'LW', ovr: 80, stats: { pac: 91, sho: 79, pas: 75, dri: 80, def: 43, phy: 75 } },
      { id: 'watkins', name: 'Ollie Watkins', pos: 'ST', ovr: 85, stats: { pac: 93, sho: 92, pas: 81, dri: 88, def: 51, phy: 77 } },

      { id: 'bizot', name: 'Marco Bizot', pos: 'GK', ovr: 75, stats: { div: 74, han: 78, kic: 70, ref: 81, spd: 43, pos: 72 } },
      { id: 'mings', name: 'Tyrone Mings', pos: 'CB', ovr: 78, stats: { pac: 67, sho: 43, pas: 73, dri: 69, def: 81, phy: 81 } },
      { id: 'maatsen', name: 'Ian Maatsen', pos: 'LB', ovr: 79, stats: { pac: 77, sho: 60, pas: 79, dri: 83, def: 81, phy: 78 } },
      { id: 'onana_a', name: 'Amadou Onana', pos: 'CDM', ovr: 80, stats: { pac: 64, sho: 69, pas: 76, dri: 79, def: 88, phy: 86 } },
      { id: 'mcginn', name: 'John McGinn', pos: 'CM', ovr: 80, stats: { pac: 78, sho: 69, pas: 87, dri: 75, def: 76, phy: 82 } },
      { id: 'duran', name: 'Jhon Durán', pos: 'ST', ovr: 79, stats: { pac: 79, sho: 89, pas: 71, dri: 79, def: 53, phy: 72 } },
      { id: 'malen', name: 'Donyell Malen', pos: 'LW', ovr: 79, stats: { pac: 81, sho: 73, pas: 73, dri: 89, def: 53, phy: 66 } },
      { id: 'barkley', name: 'Ross Barkley', pos: 'CAM', ovr: 76, stats: { pac: 74, sho: 73, pas: 88, dri: 82, def: 57, phy: 63 } },
      { id: 'cash2', name: 'Amadou Diakite', pos: 'RB', ovr: 71, stats: { pac: 79, sho: 43, pas: 73, dri: 66, def: 64, phy: 64 } }
    ]
  },
  {
    id: 'bournemouth',
    name: 'AFC Bournemouth',
    logo: '🍒',
    squad: [
      { id: 'petrovic', name: 'Đorđe Petrović', pos: 'GK', ovr: 80, stats: { div: 83, han: 77, kic: 73, ref: 82, spd: 35, pos: 81 } },
      { id: 'smith', name: 'Adam Smith', pos: 'RB', ovr: 76, stats: { pac: 75, sho: 55, pas: 66, dri: 79, def: 74, phy: 73 } },
      { id: 'senesi', name: 'Marcos Senesi', pos: 'CB', ovr: 80, stats: { pac: 75, sho: 52, pas: 70, dri: 61, def: 86, phy: 80 } },
      { id: 'zabarnyi', name: 'Illia Zabarnyi', pos: 'CB', ovr: 81, stats: { pac: 71, sho: 55, pas: 76, dri: 65, def: 83, phy: 82 } },
      { id: 'kerkez_h', name: 'Alex Jimenez', pos: 'LB', ovr: 76, stats: { pac: 77, sho: 50, pas: 68, dri: 73, def: 79, phy: 72 } },
      { id: 'cook', name: 'Lewis Cook', pos: 'CDM', ovr: 78, stats: { pac: 73, sho: 65, pas: 74, dri: 73, def: 76, phy: 77 } },
      { id: 'scott', name: 'Alex Scott', pos: 'CM', ovr: 78, stats: { pac: 71, sho: 71, pas: 84, dri: 78, def: 69, phy: 73 } },
      { id: 'christie', name: 'Ryan Christie', pos: 'CAM', ovr: 78, stats: { pac: 74, sho: 81, pas: 88, dri: 80, def: 49, phy: 70 } },
      { id: 'semenyo2', name: 'Antoine Semenyo', pos: 'RW', ovr: 82, stats: { pac: 92, sho: 78, pas: 82, dri: 91, def: 52, phy: 69 } },
      { id: 'kluivert', name: 'Justin Kluivert', pos: 'LW', ovr: 79, stats: { pac: 83, sho: 71, pas: 72, dri: 85, def: 51, phy: 64 } },
      { id: 'evanilson', name: 'Evanilson', pos: 'ST', ovr: 80, stats: { pac: 82, sho: 88, pas: 68, dri: 84, def: 50, phy: 73 } },

      { id: 'travers', name: 'Mark Travers', pos: 'GK', ovr: 76, stats: { div: 79, han: 70, kic: 71, ref: 81, spd: 31, pos: 75 } },
      { id: 'kelly', name: 'Marcus Tavernier', pos: 'LM', ovr: 78, stats: { pac: 68, sho: 75, pas: 82, dri: 73, def: 67, phy: 80 } },
      { id: 'araujo_b', name: 'Julián Araujo', pos: 'RB', ovr: 75, stats: { pac: 76, sho: 55, pas: 73, dri: 79, def: 74, phy: 74 } },
      { id: 'unal', name: 'Enes Ünal', pos: 'ST', ovr: 76, stats: { pac: 84, sho: 83, pas: 71, dri: 78, def: 50, phy: 73 } },
      { id: 'brooks', name: 'David Brooks', pos: 'CAM', ovr: 76, stats: { pac: 77, sho: 77, pas: 82, dri: 79, def: 49, phy: 70 } },
      { id: 'adams_t', name: 'Tyler Adams', pos: 'CDM', ovr: 77, stats: { pac: 70, sho: 63, pas: 77, dri: 68, def: 76, phy: 76 } },
      { id: 'hill', name: 'Bafodé Diakité', pos: 'CB', ovr: 77, stats: { pac: 66, sho: 45, pas: 69, dri: 59, def: 78, phy: 81 } },
      { id: 'winterburn', name: 'Owen Winterburn', pos: 'LB', ovr: 71, stats: { pac: 75, sho: 42, pas: 66, dri: 70, def: 68, phy: 61 } },
      { id: 'ouattara', name: 'Dango Ouattara', pos: 'RW', ovr: 78, stats: { pac: 85, sho: 81, pas: 75, dri: 86, def: 50, phy: 71 } }
    ]
  },
  {
    id: 'sunderland',
    name: 'Sunderland AFC',
    logo: '🐈',
    squad: [
      { id: 'roefs', name: 'Anthony Patterson', pos: 'GK', ovr: 77, stats: { div: 77, han: 71, kic: 68, ref: 82, spd: 43, pos: 82 } },
      { id: 'hume', name: 'Trai Hume', pos: 'RB', ovr: 76, stats: { pac: 77, sho: 55, pas: 73, dri: 75, def: 71, phy: 67 } },
      { id: 'ballard', name: 'Daniel Ballard', pos: 'CB', ovr: 76, stats: { pac: 67, sho: 40, pas: 66, dri: 64, def: 79, phy: 74 } },
      { id: 'alderete', name: 'Nordi Mukiele', pos: 'CB', ovr: 76, stats: { pac: 68, sho: 42, pas: 69, dri: 56, def: 79, phy: 79 } },
      { id: 'lea-siliki', name: 'Reinildo Mandava', pos: 'LB', ovr: 75, stats: { pac: 71, sho: 53, pas: 67, dri: 73, def: 68, phy: 68 } },
      { id: 'sadiki', name: 'Habib Diarra', pos: 'CDM', ovr: 78, stats: { pac: 65, sho: 62, pas: 79, dri: 71, def: 85, phy: 84 } },
      { id: 'rigg', name: 'Chris Rigg', pos: 'CM', ovr: 77, stats: { pac: 68, sho: 64, pas: 75, dri: 77, def: 75, phy: 73 } },
      { id: 'xhaka', name: 'Granit Xhaka', pos: 'CM', ovr: 82, stats: { pac: 78, sho: 77, pas: 88, dri: 85, def: 79, phy: 76 } },
      { id: 'mayenda', name: 'Eliezer Mayenda', pos: 'ST', ovr: 76, stats: { pac: 73, sho: 78, pas: 64, dri: 80, def: 47, phy: 69 } },
      { id: 'isidor', name: 'Wilson Isidor', pos: 'ST', ovr: 77, stats: { pac: 82, sho: 86, pas: 65, dri: 80, def: 50, phy: 68 } },
      { id: 'roberts_pat', name: 'Patrick Roberts', pos: 'RW', ovr: 76, stats: { pac: 88, sho: 80, pas: 67, dri: 76, def: 42, phy: 68 } },

      { id: 'bass', name: 'Simon Moore', pos: 'GK', ovr: 71, stats: { div: 77, han: 69, kic: 65, ref: 69, spd: 40, pos: 72 } },
      { id: 'alese', name: 'Timothée Pembélé', pos: 'LB', ovr: 73, stats: { pac: 70, sho: 52, pas: 73, dri: 72, def: 66, phy: 73 } },
      { id: 'neil', name: 'Dan Neil', pos: 'CM', ovr: 75, stats: { pac: 72, sho: 65, pas: 78, dri: 73, def: 67, phy: 71 } },
      { id: 'vitinho', name: 'Vitinho', pos: 'LW', ovr: 76, stats: { pac: 88, sho: 78, pas: 67, dri: 88, def: 46, phy: 70 } },
      { id: 'le_fee', name: 'Enzo Le Fée', pos: 'CAM', ovr: 78, stats: { pac: 76, sho: 75, pas: 87, dri: 90, def: 51, phy: 74 } },
      { id: 'diarra2', name: 'Nazariy Rusyn', pos: 'ST', ovr: 72, stats: { pac: 75, sho: 78, pas: 63, dri: 77, def: 39, phy: 72 } },
      { id: 'huggins', name: 'Leo Hjelde', pos: 'CB', ovr: 72, stats: { pac: 68, sho: 37, pas: 69, dri: 55, def: 76, phy: 75 } },
      { id: 'mundle', name: 'Romaine Mundle', pos: 'RW', ovr: 73, stats: { pac: 80, sho: 65, pas: 73, dri: 75, def: 38, phy: 67 } },
      { id: 'golden', name: 'Adam Golden', pos: 'CDM', ovr: 70, stats: { pac: 58, sho: 61, pas: 70, dri: 61, def: 68, phy: 77 } }
    ]
  },
  {
    id: 'brighton',
    name: 'Brighton & Hove Albion',
    logo: '🕊️',
    squad: [
      { id: 'verbruggen', name: 'Bart Verbruggen', pos: 'GK', ovr: 80, stats: { div: 77, han: 81, kic: 72, ref: 85, spd: 40, pos: 81 } },
      { id: 'veltman', name: 'Joel Veltman', pos: 'RB', ovr: 77, stats: { pac: 79, sho: 57, pas: 68, dri: 72, def: 77, phy: 69 } },
      { id: 'vandenberg', name: 'Jan Paul van Hecke', pos: 'CB', ovr: 79, stats: { pac: 72, sho: 49, pas: 71, dri: 64, def: 86, phy: 79 } },
      { id: 'dunk', name: 'Lewis Dunk', pos: 'CB', ovr: 80, stats: { pac: 74, sho: 47, pas: 69, dri: 61, def: 80, phy: 77 } },
      { id: 'estupinan', name: 'Pervis Estupiñán', pos: 'LB', ovr: 80, stats: { pac: 82, sho: 59, pas: 72, dri: 75, def: 78, phy: 77 } },
      { id: 'baleba', name: 'Carlos Baleba', pos: 'CDM', ovr: 82, stats: { pac: 78, sho: 68, pas: 77, dri: 71, def: 82, phy: 81 } },
      { id: 'milner', name: 'Matt O\'Riley', pos: 'CM', ovr: 80, stats: { pac: 70, sho: 66, pas: 84, dri: 77, def: 78, phy: 79 } },
      { id: 'minteh', name: 'Yankuba Minteh', pos: 'RW', ovr: 80, stats: { pac: 90, sho: 74, pas: 80, dri: 86, def: 52, phy: 71 } },
      { id: 'rutter', name: 'Georginio Rutter', pos: 'CAM', ovr: 80, stats: { pac: 76, sho: 77, pas: 82, dri: 81, def: 61, phy: 72 } },
      { id: 'welbeck', name: 'Danny Welbeck', pos: 'ST', ovr: 79, stats: { pac: 86, sho: 84, pas: 66, dri: 83, def: 44, phy: 71 } },
      { id: 'gruda', name: 'Kaoru Mitoma', pos: 'LW', ovr: 82, stats: { pac: 91, sho: 78, pas: 84, dri: 83, def: 53, phy: 73 } },

      { id: 'steele', name: 'Jason Steele', pos: 'GK', ovr: 73, stats: { div: 77, han: 69, kic: 65, ref: 75, spd: 36, pos: 77 } },
      { id: 'hinshelwood', name: 'Jack Hinshelwood', pos: 'CM', ovr: 76, stats: { pac: 76, sho: 66, pas: 81, dri: 77, def: 71, phy: 79 } },
      { id: 'gilmour', name: 'Billy Gilmour', pos: 'CM', ovr: 78, stats: { pac: 68, sho: 67, pas: 84, dri: 74, def: 66, phy: 71 } },
      { id: 'ayari', name: 'Yasin Ayari', pos: 'CDM', ovr: 76, stats: { pac: 60, sho: 61, pas: 75, dri: 67, def: 77, phy: 80 } },
      { id: 'joao_pedro', name: 'Diego Coppola', pos: 'CB', ovr: 74, stats: { pac: 68, sho: 43, pas: 68, dri: 65, def: 81, phy: 78 } },
      { id: 'enciso', name: 'Facundo Buonanotte', pos: 'CAM', ovr: 78, stats: { pac: 76, sho: 81, pas: 83, dri: 85, def: 56, phy: 75 } },
      { id: 'lamptey', name: 'Tariq Lamptey', pos: 'RB', ovr: 76, stats: { pac: 82, sho: 47, pas: 68, dri: 72, def: 77, phy: 71 } },
      { id: 'hinestroza', name: 'Stefanos Tzimas', pos: 'ST', ovr: 74, stats: { pac: 74, sho: 75, pas: 68, dri: 78, def: 49, phy: 70 } },
      { id: 'webster', name: 'Adam Webster', pos: 'CB', ovr: 75, stats: { pac: 67, sho: 40, pas: 61, dri: 60, def: 77, phy: 74 } }
    ]
  },
  {
    id: 'brentford',
    name: 'Brentford FC',
    logo: '🐝',
    squad: [
      { id: 'flekken', name: 'Caoimhín Kelleher', pos: 'GK', ovr: 79, stats: { div: 76, han: 83, kic: 74, ref: 82, spd: 44, pos: 84 } },
      { id: 'roerslev', name: 'Rasmus Nissen', pos: 'RB', ovr: 75, stats: { pac: 79, sho: 48, pas: 65, dri: 76, def: 73, phy: 71 } },
      { id: 'collins_b', name: 'Nathan Collins', pos: 'CB', ovr: 80, stats: { pac: 77, sho: 46, pas: 73, dri: 68, def: 84, phy: 77 } },
      { id: 'pinnock', name: 'Sepp van den Berg', pos: 'CB', ovr: 78, stats: { pac: 68, sho: 46, pas: 72, dri: 68, def: 80, phy: 82 } },
      { id: 'lewis-p', name: 'Keane Lewis-Potter', pos: 'LB', ovr: 77, stats: { pac: 76, sho: 58, pas: 77, dri: 76, def: 74, phy: 69 } },
      { id: 'norgaard', name: 'Christian Nørgaard', pos: 'CDM', ovr: 78, stats: { pac: 66, sho: 70, pas: 75, dri: 72, def: 88, phy: 82 } },
      { id: 'janelt', name: 'Vitaly Janelt', pos: 'CM', ovr: 77, stats: { pac: 72, sho: 68, pas: 77, dri: 75, def: 72, phy: 77 } },
      { id: 'damsgaard', name: 'Mikkel Damsgaard', pos: 'CAM', ovr: 79, stats: { pac: 78, sho: 73, pas: 86, dri: 90, def: 54, phy: 73 } },
      { id: 'mbeumo', name: 'Fabio Carvalho', pos: 'RW', ovr: 79, stats: { pac: 82, sho: 83, pas: 76, dri: 82, def: 43, phy: 70 } },
      { id: 'schade', name: 'Kevin Schade', pos: 'LW', ovr: 80, stats: { pac: 89, sho: 73, pas: 82, dri: 91, def: 48, phy: 65 } },
      { id: 'wissa', name: 'Igor Thiago', pos: 'ST', ovr: 79, stats: { pac: 86, sho: 85, pas: 74, dri: 81, def: 46, phy: 79 } },

      { id: 'valdimarsson', name: 'Hákon Rafn Valdimarsson', pos: 'GK', ovr: 74, stats: { div: 80, han: 70, kic: 67, ref: 75, spd: 44, pos: 74 } },
      { id: 'ajer', name: 'Kristoffer Ajer', pos: 'CB', ovr: 76, stats: { pac: 73, sho: 50, pas: 65, dri: 65, def: 79, phy: 83 } },
      { id: 'yarmoliuk', name: 'Mathias Jensen', pos: 'CM', ovr: 76, stats: { pac: 70, sho: 72, pas: 77, dri: 74, def: 69, phy: 80 } },
      { id: 'henry_t', name: 'Yehor Yarmoliuk', pos: 'CDM', ovr: 74, stats: { pac: 64, sho: 56, pas: 72, dri: 66, def: 79, phy: 77 } },
      { id: 'kayode', name: 'Michael Kayode', pos: 'RB', ovr: 74, stats: { pac: 75, sho: 48, pas: 66, dri: 74, def: 73, phy: 65 } },
      { id: 'trevitt', name: 'Ellery Balcombe', pos: 'RB', ovr: 68, stats: { pac: 70, sho: 55, pas: 62, dri: 60, def: 66, phy: 65 } },
      { id: 'goode', name: 'Gustavo Nunes', pos: 'RW', ovr: 74, stats: { pac: 84, sho: 76, pas: 76, dri: 80, def: 36, phy: 64 } },
      { id: 'reyes', name: 'Antoni Milambo', pos: 'CM', ovr: 74, stats: { pac: 69, sho: 70, pas: 82, dri: 73, def: 66, phy: 71 } },
      { id: 'ouedraogo', name: 'Dango Touré', pos: 'ST', ovr: 71, stats: { pac: 77, sho: 76, pas: 65, dri: 69, def: 41, phy: 73 } }
    ]
  },
  {
    id: 'chelsea',
    name: 'Chelsea FC',
    logo: '🦁',
    squad: [
      { id: 'sanchez_r', name: 'Robert Sánchez', pos: 'GK', ovr: 81, stats: { div: 80, han: 82, kic: 74, ref: 87, spd: 43, pos: 85 } },
      { id: 'james', name: 'Reece James', pos: 'RB', ovr: 82, stats: { pac: 83, sho: 56, pas: 81, dri: 83, def: 84, phy: 70 } },
      { id: 'colwill', name: 'Levi Colwill', pos: 'CB', ovr: 81, stats: { pac: 68, sho: 53, pas: 78, dri: 73, def: 88, phy: 82 } },
      { id: 'badiashile', name: 'Wesley Fofana', pos: 'CB', ovr: 79, stats: { pac: 66, sho: 51, pas: 75, dri: 64, def: 85, phy: 86 } },
      { id: 'anselmino', name: 'Alex Matos', pos: 'LB', ovr: 74, stats: { pac: 76, sho: 52, pas: 68, dri: 70, def: 73, phy: 74 } },
      { id: 'caicedo', name: 'Moisés Caicedo', pos: 'CDM', ovr: 85, stats: { pac: 76, sho: 75, pas: 79, dri: 74, def: 93, phy: 88 } },
      { id: 'fernandez_e', name: 'Enzo Fernández', pos: 'CM', ovr: 85, stats: { pac: 76, sho: 82, pas: 85, dri: 85, def: 74, phy: 80 } },
      { id: 'palmer', name: 'Cole Palmer', pos: 'CAM', ovr: 87, stats: { pac: 77, sho: 89, pas: 95, dri: 95, def: 59, phy: 78 } },
      { id: 'neto_c', name: 'Pedro Neto', pos: 'RW', ovr: 82, stats: { pac: 88, sho: 81, pas: 80, dri: 87, def: 47, phy: 76 } },
      { id: 'nkunku', name: 'Estevão', pos: 'LW', ovr: 81, stats: { pac: 85, sho: 78, pas: 77, dri: 84, def: 50, phy: 72 } },
      { id: 'joao_pedro_c', name: 'João Pedro', pos: 'ST', ovr: 82, stats: { pac: 91, sho: 86, pas: 80, dri: 86, def: 49, phy: 79 } },

      { id: 'jorgensen', name: 'Filip Jørgensen', pos: 'GK', ovr: 74, stats: { div: 77, han: 75, kic: 61, ref: 77, spd: 37, pos: 78 } },
      { id: 'chalobah', name: 'Trevoh Chalobah', pos: 'CB', ovr: 77, stats: { pac: 66, sho: 51, pas: 70, dri: 61, def: 83, phy: 80 } },
      { id: 'gusto', name: 'Malo Gusto', pos: 'RB', ovr: 78, stats: { pac: 82, sho: 57, pas: 76, dri: 80, def: 78, phy: 77 } },
      { id: 'acheampong', name: 'Josh Acheampong', pos: 'CB', ovr: 74, stats: { pac: 68, sho: 42, pas: 65, dri: 61, def: 81, phy: 71 } },
      { id: 'lavia', name: 'Roméo Lavia', pos: 'CDM', ovr: 79, stats: { pac: 67, sho: 68, pas: 73, dri: 69, def: 83, phy: 87 } },
      { id: 'gittens', name: 'Jamie Gittens', pos: 'LW', ovr: 79, stats: { pac: 87, sho: 82, pas: 79, dri: 82, def: 51, phy: 69 } },
      { id: 'george_c', name: 'Marc Guiu', pos: 'ST', ovr: 73, stats: { pac: 80, sho: 82, pas: 63, dri: 70, def: 49, phy: 65 } },
      { id: 'santos', name: 'Andrey Santos', pos: 'CM', ovr: 78, stats: { pac: 78, sho: 74, pas: 85, dri: 84, def: 76, phy: 80 } },
      { id: 'fernandez_a', name: 'Tyrique George', pos: 'RW', ovr: 75, stats: { pac: 81, sho: 74, pas: 68, dri: 80, def: 32, phy: 65 } }
    ]
  },
  {
    id: 'fulham',
    name: 'Fulham FC',
    logo: '🐇',
    squad: [
      { id: 'leno', name: 'Bernd Leno', pos: 'GK', ovr: 82, stats: { div: 85, han: 82, kic: 77, ref: 88, spd: 31, pos: 79 } },
      { id: 'castagne', name: 'Timothy Castagne', pos: 'RB', ovr: 78, stats: { pac: 74, sho: 59, pas: 75, dri: 81, def: 73, phy: 67 } },
      { id: 'bassey', name: 'Calvin Bassey', pos: 'CB', ovr: 79, stats: { pac: 75, sho: 54, pas: 69, dri: 64, def: 79, phy: 86 } },
      { id: 'diop_f', name: 'Joachim Andersen', pos: 'CB', ovr: 80, stats: { pac: 70, sho: 50, pas: 67, dri: 71, def: 80, phy: 81 } },
      { id: 'robinson_a', name: 'Antonee Robinson', pos: 'LB', ovr: 80, stats: { pac: 84, sho: 59, pas: 81, dri: 77, def: 81, phy: 70 } },
      { id: 'sasa_lukic', name: 'Sasa Lukić', pos: 'CDM', ovr: 77, stats: { pac: 66, sho: 58, pas: 75, dri: 70, def: 86, phy: 73 } },
      { id: 'smith-rowe', name: 'Emile Smith Rowe', pos: 'CAM', ovr: 79, stats: { pac: 73, sho: 76, pas: 90, dri: 89, def: 50, phy: 73 } },
      { id: 'iwobi', name: 'Alex Iwobi', pos: 'CM', ovr: 79, stats: { pac: 74, sho: 77, pas: 81, dri: 78, def: 67, phy: 72 } },
      { id: 'king_o', name: 'Alex Muyumba', pos: 'RW', ovr: 74, stats: { pac: 86, sho: 71, pas: 72, dri: 82, def: 43, phy: 58 } },
      { id: 'wilson_h', name: 'Harry Wilson', pos: 'LW', ovr: 78, stats: { pac: 89, sho: 73, pas: 70, dri: 85, def: 41, phy: 71 } },
      { id: 'jimenez_r', name: 'Rodrigo Muniz', pos: 'ST', ovr: 78, stats: { pac: 77, sho: 81, pas: 74, dri: 78, def: 44, phy: 79 } },

      { id: 'bettinelli', name: 'Benjamin Lecomte', pos: 'GK', ovr: 71, stats: { div: 67, han: 74, kic: 59, ref: 69, spd: 33, pos: 68 } },
      { id: 'cairney', name: 'Tom Cairney', pos: 'CM', ovr: 76, stats: { pac: 72, sho: 62, pas: 74, dri: 79, def: 65, phy: 72 } },
      { id: 'reed', name: 'Sander Berge', pos: 'CDM', ovr: 77, stats: { pac: 63, sho: 58, pas: 78, dri: 71, def: 84, phy: 79 } },
      { id: 'tete', name: 'Kenny Tete', pos: 'RB', ovr: 76, stats: { pac: 81, sho: 52, pas: 67, dri: 74, def: 79, phy: 65 } },
      { id: 'diop2', name: 'Issa Diop', pos: 'CB', ovr: 76, stats: { pac: 71, sho: 50, pas: 68, dri: 61, def: 86, phy: 73 } },
      { id: 'traore_a', name: 'Adama Traoré', pos: 'RW', ovr: 78, stats: { pac: 86, sho: 75, pas: 76, dri: 84, def: 51, phy: 63 } },
      { id: 'jackson_r', name: 'Raúl Jiménez', pos: 'ST', ovr: 77, stats: { pac: 75, sho: 84, pas: 64, dri: 76, def: 49, phy: 74 } },
      { id: 'cuenca', name: 'Ryan Sessegnon', pos: 'LB', ovr: 75, stats: { pac: 75, sho: 57, pas: 71, dri: 72, def: 74, phy: 64 } },
      { id: 'read', name: 'Josh King', pos: 'CAM', ovr: 72, stats: { pac: 70, sho: 74, pas: 80, dri: 81, def: 51, phy: 61 } }
    ]
  },
  {
    id: 'newcastle',
    name: 'Newcastle United',
    logo: '🦁',
    squad: [
      { id: 'pope', name: 'Nick Pope', pos: 'GK', ovr: 84, stats: { div: 85, han: 80, kic: 74, ref: 86, spd: 36, pos: 80 } },
      { id: 'livramento', name: 'Tino Livramento', pos: 'RB', ovr: 81, stats: { pac: 82, sho: 59, pas: 75, dri: 75, def: 84, phy: 70 } },
      { id: 'schar', name: 'Fabian Schär', pos: 'CB', ovr: 80, stats: { pac: 76, sho: 45, pas: 67, dri: 69, def: 88, phy: 83 } },
      { id: 'botman', name: 'Sven Botman', pos: 'CB', ovr: 82, stats: { pac: 75, sho: 53, pas: 72, dri: 63, def: 84, phy: 86 } },
      { id: 'burn', name: 'Dan Burn', pos: 'LB', ovr: 79, stats: { pac: 84, sho: 59, pas: 78, dri: 83, def: 78, phy: 71 } },
      { id: 'guimaraes', name: 'Bruno Guimarães', pos: 'CDM', ovr: 87, stats: { pac: 78, sho: 70, pas: 87, dri: 78, def: 86, phy: 93 } },
      { id: 'tonali', name: 'Sandro Tonali', pos: 'CM', ovr: 84, stats: { pac: 76, sho: 79, pas: 89, dri: 88, def: 80, phy: 88 } },
      { id: 'joelinton', name: 'Joelinton', pos: 'CM', ovr: 80, stats: { pac: 78, sho: 73, pas: 86, dri: 74, def: 77, phy: 82 } },
      { id: 'barnes_h', name: 'Harvey Barnes', pos: 'RW', ovr: 79, stats: { pac: 84, sho: 73, pas: 77, dri: 83, def: 45, phy: 63 } },
      { id: 'murphy_j', name: 'Jacob Murphy', pos: 'LW', ovr: 78, stats: { pac: 90, sho: 77, pas: 73, dri: 80, def: 48, phy: 62 } },
      { id: 'woltemade', name: 'Nick Woltemade', pos: 'ST', ovr: 82, stats: { pac: 88, sho: 85, pas: 73, dri: 82, def: 50, phy: 81 } },

      { id: 'dubravka', name: 'Martin Dúbravka', pos: 'GK', ovr: 74, stats: { div: 78, han: 74, kic: 62, ref: 72, spd: 32, pos: 75 } },
      { id: 'trippier', name: 'Kieran Trippier', pos: 'RB', ovr: 79, stats: { pac: 83, sho: 52, pas: 77, dri: 77, def: 76, phy: 70 } },
      { id: 'krafth', name: 'Emil Krafth', pos: 'RB', ovr: 74, stats: { pac: 79, sho: 45, pas: 69, dri: 69, def: 74, phy: 68 } },
      { id: 'lewis_l', name: 'Lewis Hall', pos: 'LB', ovr: 78, stats: { pac: 82, sho: 49, pas: 73, dri: 77, def: 70, phy: 70 } },
      { id: 'willock', name: 'Joe Willock', pos: 'CM', ovr: 78, stats: { pac: 69, sho: 66, pas: 79, dri: 76, def: 64, phy: 79 } },
      { id: 'miley', name: 'Lewis Miley', pos: 'CM', ovr: 76, stats: { pac: 66, sho: 67, pas: 82, dri: 76, def: 72, phy: 78 } },
      { id: 'ramsey_a', name: 'Alex Murphy', pos: 'RW', ovr: 74, stats: { pac: 82, sho: 71, pas: 68, dri: 75, def: 30, phy: 62 } },
      { id: 'osula', name: 'William Osula', pos: 'ST', ovr: 73, stats: { pac: 77, sho: 80, pas: 68, dri: 74, def: 38, phy: 63 } },
      { id: 'livermore', name: 'Yasin Ben Slimane', pos: 'CAM', ovr: 74, stats: { pac: 72, sho: 73, pas: 78, dri: 78, def: 55, phy: 62 } }
    ]
  },
  {
    id: 'everton',
    name: 'Everton FC',
    logo: '🔵',
    squad: [
      { id: 'pickford', name: 'Jordan Pickford', pos: 'GK', ovr: 84, stats: { div: 88, han: 80, kic: 77, ref: 86, spd: 35, pos: 82 } },
      { id: 'oneil', name: 'Jake O\'Brien', pos: 'RB', ovr: 75, stats: { pac: 75, sho: 49, pas: 67, dri: 73, def: 68, phy: 69 } },
      { id: 'keane', name: 'James Tarkowski', pos: 'CB', ovr: 79, stats: { pac: 76, sho: 47, pas: 74, dri: 69, def: 87, phy: 78 } },
      { id: 'branthwaite', name: 'Jarrad Branthwaite', pos: 'CB', ovr: 81, stats: { pac: 69, sho: 47, pas: 74, dri: 70, def: 87, phy: 79 } },
      { id: 'mykolenko', name: 'Vitaliy Mykolenko', pos: 'LB', ovr: 77, stats: { pac: 82, sho: 53, pas: 76, dri: 78, def: 74, phy: 76 } },
      { id: 'gueye', name: 'Idrissa Gueye', pos: 'CDM', ovr: 76, stats: { pac: 67, sho: 64, pas: 75, dri: 74, def: 82, phy: 74 } },
      { id: 'garner', name: 'James Garner', pos: 'CM', ovr: 76, stats: { pac: 65, sho: 67, pas: 78, dri: 73, def: 63, phy: 74 } },
      { id: 'ndiaye_i', name: 'Iliman Ndiaye', pos: 'CAM', ovr: 79, stats: { pac: 73, sho: 76, pas: 80, dri: 89, def: 50, phy: 75 } },
      { id: 'dewsbury-hall', name: 'Kiernan Dewsbury-Hall', pos: 'CM', ovr: 77, stats: { pac: 75, sho: 70, pas: 81, dri: 77, def: 70, phy: 79 } },
      { id: 'barry_a', name: 'Jack Grealish', pos: 'LW', ovr: 82, stats: { pac: 95, sho: 79, pas: 82, dri: 90, def: 48, phy: 72 } },
      { id: 'beto', name: 'Beto', pos: 'ST', ovr: 76, stats: { pac: 75, sho: 77, pas: 63, dri: 83, def: 44, phy: 75 } },

      { id: 'virginia', name: 'João Virgínia', pos: 'GK', ovr: 71, stats: { div: 72, han: 67, kic: 60, ref: 72, spd: 36, pos: 71 } },
      { id: 'patterson_n', name: 'Nathan Patterson', pos: 'RB', ovr: 74, stats: { pac: 72, sho: 48, pas: 67, dri: 71, def: 70, phy: 69 } },
      { id: 'coleman', name: 'Séamus Coleman', pos: 'RB', ovr: 72, stats: { pac: 77, sho: 50, pas: 63, dri: 65, def: 72, phy: 63 } },
      { id: 'young_a', name: 'Ashley Young', pos: 'LB', ovr: 73, stats: { pac: 78, sho: 51, pas: 74, dri: 75, def: 69, phy: 68 } },
      { id: 'mcneil', name: 'Dwight McNeil', pos: 'LW', ovr: 78, stats: { pac: 82, sho: 74, pas: 80, dri: 86, def: 45, phy: 69 } },
      { id: 'alcaraz_c', name: 'Carlos Alcaraz', pos: 'CAM', ovr: 77, stats: { pac: 78, sho: 73, pas: 82, dri: 86, def: 57, phy: 71 } },
      { id: 'barrett_t', name: 'Tim Iroegbunam', pos: 'CDM', ovr: 74, stats: { pac: 68, sho: 63, pas: 74, dri: 68, def: 80, phy: 75 } },
      { id: 'broja', name: 'Armando Broja', pos: 'ST', ovr: 74, stats: { pac: 75, sho: 78, pas: 62, dri: 73, def: 49, phy: 70 } },
      { id: 'lindstrom', name: 'Jesper Lindstrøm', pos: 'CAM', ovr: 75, stats: { pac: 68, sho: 69, pas: 76, dri: 85, def: 46, phy: 70 } }
    ]
  },
  {
    id: 'leeds',
    name: 'Leeds United',
    logo: '⚪',
    squad: [
      { id: 'perri', name: 'Lucas Perri', pos: 'GK', ovr: 78, stats: { div: 82, han: 81, kic: 65, ref: 78, spd: 41, pos: 74 } },
      { id: 'ampadu_r', name: 'Jayden Bogle', pos: 'RB', ovr: 76, stats: { pac: 77, sho: 48, pas: 76, dri: 77, def: 78, phy: 66 } },
      { id: 'rodon', name: 'Joe Rodon', pos: 'CB', ovr: 77, stats: { pac: 68, sho: 46, pas: 71, dri: 60, def: 80, phy: 76 } },
      { id: 'struijk', name: 'Pascal Struijk', pos: 'CB', ovr: 78, stats: { pac: 73, sho: 47, pas: 70, dri: 62, def: 86, phy: 80 } },
      { id: 'gruev', name: 'Kristoffer Klaesson', pos: 'LB', ovr: 75, stats: { pac: 81, sho: 49, pas: 76, dri: 79, def: 73, phy: 66 } },
      { id: 'ampadu', name: 'Ethan Ampadu', pos: 'CDM', ovr: 79, stats: { pac: 68, sho: 65, pas: 83, dri: 77, def: 87, phy: 77 } },
      { id: 'gray', name: 'Ilia Gruev', pos: 'CM', ovr: 76, stats: { pac: 67, sho: 70, pas: 84, dri: 77, def: 63, phy: 78 } },
      { id: 'james_dan', name: 'Daniel James', pos: 'RW', ovr: 77, stats: { pac: 89, sho: 72, pas: 76, dri: 80, def: 50, phy: 63 } },
      { id: 'okafor', name: 'Noah Okafor', pos: 'LW', ovr: 76, stats: { pac: 83, sho: 79, pas: 69, dri: 81, def: 42, phy: 60 } },
      { id: 'aaronson', name: 'Brenden Aaronson', pos: 'CAM', ovr: 76, stats: { pac: 67, sho: 74, pas: 79, dri: 88, def: 50, phy: 62 } },
      { id: 'piroe', name: 'Joel Piroe', pos: 'ST', ovr: 78, stats: { pac: 86, sho: 88, pas: 72, dri: 83, def: 44, phy: 71 } },

      { id: 'darlow', name: 'Karl Darlow', pos: 'GK', ovr: 70, stats: { div: 74, han: 71, kic: 58, ref: 74, spd: 36, pos: 65 } },
      { id: 'firpo2', name: 'Karl Hein', pos: 'LB', ovr: 74, stats: { pac: 71, sho: 47, pas: 74, dri: 73, def: 75, phy: 68 } },
      { id: 'rothwell', name: 'Sam Byram', pos: 'RB', ovr: 71, stats: { pac: 68, sho: 44, pas: 65, dri: 64, def: 68, phy: 69 } },
      { id: 'longstaff', name: 'Sean Longstaff', pos: 'CM', ovr: 75, stats: { pac: 68, sho: 62, pas: 84, dri: 76, def: 61, phy: 73 } },
      { id: 'stach', name: 'Ao Tanaka', pos: 'CM', ovr: 75, stats: { pac: 66, sho: 63, pas: 78, dri: 76, def: 64, phy: 72 } },
      { id: 'kamara_j', name: 'Jack Harrison', pos: 'RW', ovr: 76, stats: { pac: 86, sho: 69, pas: 78, dri: 77, def: 44, phy: 66 } },
      { id: 'nmecha_l', name: 'Lukas Nmecha', pos: 'ST', ovr: 73, stats: { pac: 82, sho: 80, pas: 64, dri: 75, def: 45, phy: 75 } },
      { id: 'cresswell_c', name: 'Charlie Cresswell', pos: 'CB', ovr: 73, stats: { pac: 62, sho: 37, pas: 68, dri: 57, def: 80, phy: 77 } },
      { id: 'gnonto', name: 'Willy Gnonto', pos: 'LW', ovr: 76, stats: { pac: 87, sho: 77, pas: 70, dri: 77, def: 45, phy: 70 } }
    ]
  },
  {
    id: 'crystal_palace',
    name: 'Crystal Palace',
    logo: '🦅',
    squad: [
      { id: 'henderson_d', name: 'Dean Henderson', pos: 'GK', ovr: 81, stats: { div: 79, han: 83, kic: 73, ref: 85, spd: 39, pos: 84 } },
      { id: 'munoz_d', name: 'Daniel Muñoz', pos: 'RB', ovr: 80, stats: { pac: 77, sho: 59, pas: 75, dri: 76, def: 73, phy: 70 } },
      { id: 'guehi_m', name: 'Marc Guéhi', pos: 'CB', ovr: 82, stats: { pac: 69, sho: 57, pas: 74, dri: 74, def: 87, phy: 81 } },
      { id: 'lacroix_m', name: 'Maxence Lacroix', pos: 'CB', ovr: 80, stats: { pac: 75, sho: 46, pas: 70, dri: 69, def: 88, phy: 80 } },
      { id: 'mitchell_t', name: 'Tyrick Mitchell', pos: 'LB', ovr: 79, stats: { pac: 76, sho: 53, pas: 80, dri: 80, def: 82, phy: 72 } },
      { id: 'wharton', name: 'Adam Wharton', pos: 'CDM', ovr: 81, stats: { pac: 77, sho: 67, pas: 79, dri: 80, def: 85, phy: 87 } },
      { id: 'hughes_w', name: 'Will Hughes', pos: 'CM', ovr: 76, stats: { pac: 73, sho: 63, pas: 81, dri: 80, def: 69, phy: 72 } },
      { id: 'sarr_i', name: 'Ismaïla Sarr', pos: 'RW', ovr: 81, stats: { pac: 84, sho: 81, pas: 75, dri: 88, def: 48, phy: 73 } },
      { id: 'eze', name: 'Eberechi Eze', pos: 'CAM', ovr: 84, stats: { pac: 78, sho: 77, pas: 94, dri: 88, def: 66, phy: 73 } },
      { id: 'mateta', name: 'Jean-Philippe Mateta', pos: 'ST', ovr: 80, stats: { pac: 89, sho: 91, pas: 67, dri: 84, def: 48, phy: 80 } },
      { id: 'nketiah', name: 'Yankuba Sonko', pos: 'LW', ovr: 75, stats: { pac: 85, sho: 78, pas: 67, dri: 82, def: 46, phy: 59 } },

      { id: 'johnstone', name: 'Sam Johnstone', pos: 'GK', ovr: 74, stats: { div: 71, han: 76, kic: 65, ref: 75, spd: 38, pos: 75 } },
      { id: 'richards_c', name: 'Chris Richards', pos: 'CB', ovr: 77, stats: { pac: 71, sho: 52, pas: 67, dri: 66, def: 82, phy: 79 } },
      { id: 'clyne', name: 'Nathaniel Clyne', pos: 'RB', ovr: 71, stats: { pac: 72, sho: 49, pas: 64, dri: 64, def: 72, phy: 65 } },
      { id: 'kamada', name: 'Daichi Kamada', pos: 'CAM', ovr: 78, stats: { pac: 73, sho: 77, pas: 81, dri: 81, def: 53, phy: 76 } },
      { id: 'lerma', name: 'Jefferson Lerma', pos: 'CDM', ovr: 77, stats: { pac: 64, sho: 68, pas: 75, dri: 66, def: 85, phy: 78 } },
      { id: 'devenny_j', name: 'Justin Devenny', pos: 'CM', ovr: 71, stats: { pac: 70, sho: 62, pas: 70, dri: 73, def: 67, phy: 67 } },
      { id: 'ayew_j', name: 'Jordan Ayew', pos: 'ST', ovr: 76, stats: { pac: 77, sho: 77, pas: 69, dri: 83, def: 50, phy: 75 } },
      { id: 'rak-sakyi', name: 'Jesurun Rak-Sakyi', pos: 'RW', ovr: 75, stats: { pac: 88, sho: 75, pas: 75, dri: 81, def: 38, phy: 61 } },
      { id: 'kporha', name: 'Borna Sosa', pos: 'LB', ovr: 74, stats: { pac: 72, sho: 53, pas: 64, dri: 73, def: 70, phy: 72 } }
    ]
  },
  {
    id: 'nottingham_forest',
    name: 'Nottingham Forest',
    logo: '🌳',
    squad: [
      { id: 'sels', name: 'Matz Sels', pos: 'GK', ovr: 82, stats: { div: 84, han: 82, kic: 70, ref: 82, spd: 45, pos: 84 } },
      { id: 'aina', name: 'Ola Aina', pos: 'RB', ovr: 79, stats: { pac: 81, sho: 58, pas: 79, dri: 72, def: 83, phy: 75 } },
      { id: 'murillo', name: 'Murillo', pos: 'CB', ovr: 81, stats: { pac: 72, sho: 53, pas: 71, dri: 72, def: 88, phy: 85 } },
      { id: 'milenkovic', name: 'Nikola Milenković', pos: 'CB', ovr: 80, stats: { pac: 68, sho: 56, pas: 71, dri: 71, def: 79, phy: 77 } },
      { id: 'williams_n', name: 'Neco Williams', pos: 'LB', ovr: 78, stats: { pac: 76, sho: 50, pas: 72, dri: 79, def: 74, phy: 77 } },
      { id: 'yates', name: 'Ryan Yates', pos: 'CDM', ovr: 76, stats: { pac: 71, sho: 66, pas: 71, dri: 72, def: 81, phy: 74 } },
      { id: 'danilo_f', name: 'Danilo', pos: 'CM', ovr: 76, stats: { pac: 68, sho: 66, pas: 78, dri: 74, def: 74, phy: 72 } },
      { id: 'gibbs-white', name: 'Morgan Gibbs-White', pos: 'CAM', ovr: 83, stats: { pac: 81, sho: 84, pas: 90, dri: 93, def: 60, phy: 79 } },
      { id: 'sangare', name: 'Ibrahim Sangaré', pos: 'CDM', ovr: 78, stats: { pac: 62, sho: 59, pas: 78, dri: 73, def: 84, phy: 83 } },
      { id: 'hudson-odoi', name: 'Callum Hudson-Odoi', pos: 'LW', ovr: 78, stats: { pac: 85, sho: 78, pas: 74, dri: 86, def: 43, phy: 73 } },
      { id: 'igor_jesus', name: 'Igor Jesus', pos: 'ST', ovr: 79, stats: { pac: 82, sho: 89, pas: 73, dri: 79, def: 44, phy: 70 } },

      { id: 'carlos_miguel', name: 'Carlos Miguel', pos: 'GK', ovr: 72, stats: { div: 72, han: 71, kic: 61, ref: 75, spd: 34, pos: 74 } },
      { id: 'boly', name: 'Willy Boly', pos: 'CB', ovr: 74, stats: { pac: 69, sho: 48, pas: 72, dri: 56, def: 76, phy: 77 } },
      { id: 'toffolo', name: 'Harry Toffolo', pos: 'LB', ovr: 74, stats: { pac: 74, sho: 50, pas: 67, dri: 69, def: 67, phy: 65 } },
      { id: 'dominguez_n', name: 'Nicolás Domínguez', pos: 'CDM', ovr: 78, stats: { pac: 67, sho: 65, pas: 73, dri: 76, def: 78, phy: 78 } },
      { id: 'yang', name: 'Ramón Sosa Jr', pos: 'RW', ovr: 76, stats: { pac: 85, sho: 72, pas: 75, dri: 82, def: 44, phy: 66 } },
      { id: 'wood_c', name: 'Chris Wood', pos: 'ST', ovr: 78, stats: { pac: 79, sho: 78, pas: 75, dri: 80, def: 54, phy: 71 } },
      { id: 'awoniyi', name: 'Taiwo Awoniyi', pos: 'ST', ovr: 77, stats: { pac: 78, sho: 78, pas: 69, dri: 84, def: 49, phy: 73 } },
      { id: 'gomes_j', name: 'Ramon Sosa', pos: 'LW', ovr: 74, stats: { pac: 82, sho: 76, pas: 69, dri: 85, def: 45, phy: 67 } },
      { id: 'worrall', name: 'Joe Worrall', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 42, pas: 66, dri: 55, def: 78, phy: 70 } }
    ]
  },
  {
    id: 'tottenham',
    name: 'Tottenham Hotspur',
    logo: '🐓',
    squad: [
      { id: 'vicario', name: 'Guglielmo Vicario', pos: 'GK', ovr: 83, stats: { div: 84, han: 85, kic: 73, ref: 90, spd: 40, pos: 79 } },
      { id: 'porro', name: 'Pedro Porro', pos: 'RB', ovr: 82, stats: { pac: 90, sho: 57, pas: 82, dri: 78, def: 85, phy: 79 } },
      { id: 'romero_c', name: 'Cristian Romero', pos: 'CB', ovr: 84, stats: { pac: 72, sho: 54, pas: 76, dri: 65, def: 84, phy: 84 } },
      { id: 'vandevenberg', name: 'Micky van de Ven', pos: 'CB', ovr: 83, stats: { pac: 75, sho: 52, pas: 76, dri: 69, def: 85, phy: 86 } },
      { id: 'spence', name: 'Djed Spence', pos: 'LB', ovr: 77, stats: { pac: 75, sho: 59, pas: 76, dri: 73, def: 73, phy: 75 } },
      { id: 'bentancur', name: 'Rodrigo Bentancur', pos: 'CDM', ovr: 80, stats: { pac: 70, sho: 69, pas: 76, dri: 78, def: 82, phy: 84 } },
      { id: 'sarr_p', name: 'Pape Matar Sarr', pos: 'CM', ovr: 80, stats: { pac: 80, sho: 73, pas: 88, dri: 83, def: 74, phy: 72 } },
      { id: 'kudus', name: 'Mohammed Kudus', pos: 'RW', ovr: 82, stats: { pac: 90, sho: 86, pas: 81, dri: 91, def: 51, phy: 75 } },
      { id: 'johnson_b', name: 'Brennan Johnson', pos: 'LW', ovr: 79, stats: { pac: 88, sho: 73, pas: 77, dri: 86, def: 51, phy: 65 } },
      { id: 'bergvall', name: 'Lucas Bergvall', pos: 'CAM', ovr: 79, stats: { pac: 77, sho: 71, pas: 90, dri: 80, def: 49, phy: 69 } },
      { id: 'richarlison', name: 'Richarlison', pos: 'ST', ovr: 79, stats: { pac: 78, sho: 87, pas: 70, dri: 84, def: 54, phy: 79 } },

      { id: 'forster_f', name: 'Fraser Forster', pos: 'GK', ovr: 74, stats: { div: 77, han: 69, kic: 62, ref: 73, spd: 34, pos: 76 } },
      { id: 'davies_b', name: 'Ben Davies', pos: 'LB', ovr: 74, stats: { pac: 76, sho: 48, pas: 66, dri: 77, def: 70, phy: 66 } },
      { id: 'gray_a', name: 'Archie Gray', pos: 'CM', ovr: 76, stats: { pac: 73, sho: 71, pas: 82, dri: 78, def: 69, phy: 70 } },
      { id: 'bissouma', name: 'Yves Bissouma', pos: 'CDM', ovr: 78, stats: { pac: 65, sho: 65, pas: 73, dri: 78, def: 80, phy: 77 } },
      { id: 'odobert', name: 'Wilson Odobert', pos: 'LW', ovr: 76, stats: { pac: 80, sho: 76, pas: 70, dri: 80, def: 49, phy: 70 } },
      { id: 'tel', name: 'Mathys Tel', pos: 'ST', ovr: 77, stats: { pac: 77, sho: 78, pas: 71, dri: 78, def: 53, phy: 77 } },
      { id: 'solanke', name: 'Dominic Solanke', pos: 'ST', ovr: 79, stats: { pac: 87, sho: 89, pas: 68, dri: 78, def: 52, phy: 73 } },
      { id: 'danso', name: 'Kevin Danso', pos: 'CB', ovr: 78, stats: { pac: 69, sho: 45, pas: 70, dri: 60, def: 82, phy: 85 } },
      { id: 'gray_a2', name: 'Djed Spence Jr', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 43, pas: 68, dri: 70, def: 66, phy: 67 } }
    ]
  },
  {
    id: 'coventry',
    name: 'Coventry City',
    logo: '🐈‍⬛',
    squad: [
      { id: 'wollacott', name: 'Oliver Dovin', pos: 'GK', ovr: 74, stats: { div: 75, han: 74, kic: 62, ref: 75, spd: 40, pos: 70 } },
      { id: 'bidwell', name: 'Jake Bidwell', pos: 'LB', ovr: 73, stats: { pac: 78, sho: 43, pas: 70, dri: 76, def: 70, phy: 72 } },
      { id: 'mcfadzean', name: 'Kelly N\'Mai', pos: 'CB', ovr: 73, stats: { pac: 70, sho: 43, pas: 61, dri: 65, def: 75, phy: 77 } },
      { id: 'hyam', name: 'Bobby Thomas', pos: 'CB', ovr: 74, stats: { pac: 71, sho: 39, pas: 67, dri: 60, def: 81, phy: 81 } },
      { id: 'godden-wildschut', name: 'Josh Wilson-Esbrand', pos: 'RB', ovr: 73, stats: { pac: 80, sho: 45, pas: 74, dri: 67, def: 76, phy: 73 } },
      { id: 'allen_j', name: 'Jamie Allen', pos: 'CDM', ovr: 73, stats: { pac: 62, sho: 59, pas: 76, dri: 73, def: 82, phy: 80 } },
      { id: 'sakamoto', name: 'Ryotaro Meshino', pos: 'RW', ovr: 76, stats: { pac: 78, sho: 75, pas: 67, dri: 88, def: 41, phy: 72 } },
      { id: 'godden', name: 'Ben Sheaf', pos: 'CM', ovr: 74, stats: { pac: 69, sho: 66, pas: 83, dri: 78, def: 66, phy: 68 } },
      { id: 'wright_b', name: 'Bobby Wright', pos: 'CAM', ovr: 72, stats: { pac: 63, sho: 66, pas: 78, dri: 75, def: 44, phy: 67 } },
      { id: 'simms', name: 'Ellis Simms', pos: 'ST', ovr: 76, stats: { pac: 82, sho: 83, pas: 71, dri: 74, def: 50, phy: 77 } },
      { id: 'rudoni', name: 'Josh Eccles', pos: 'LW', ovr: 73, stats: { pac: 85, sho: 71, pas: 64, dri: 81, def: 37, phy: 59 } },

      { id: 'wilson_m', name: 'Michael Rose', pos: 'GK', ovr: 68, stats: { div: 67, han: 64, kic: 58, ref: 67, spd: 41, pos: 73 } },
      { id: 'kaba', name: 'Milan van Ewijk', pos: 'RB', ovr: 73, stats: { pac: 73, sho: 52, pas: 63, dri: 73, def: 73, phy: 62 } },
      { id: 'sheaf2', name: 'Jack Rudoni', pos: 'CM', ovr: 74, stats: { pac: 63, sho: 64, pas: 77, dri: 74, def: 71, phy: 74 } },
      { id: 'godden2', name: 'Fabio Tavares', pos: 'RW', ovr: 71, stats: { pac: 77, sho: 64, pas: 72, dri: 75, def: 40, phy: 58 } },
      { id: 'thomas_b', name: 'Brandon Thomas-Asante', pos: 'ST', ovr: 73, stats: { pac: 72, sho: 75, pas: 68, dri: 76, def: 42, phy: 70 } },
      { id: 'binks', name: 'Luis Binks', pos: 'CB', ovr: 72, stats: { pac: 64, sho: 42, pas: 66, dri: 55, def: 73, phy: 77 } },
      { id: 'flint', name: 'Josh Flint', pos: 'CDM', ovr: 68, stats: { pac: 62, sho: 49, pas: 65, dri: 64, def: 67, phy: 71 } },
      { id: 'latibeaudiere', name: 'Jayden Wareham', pos: 'ST', ovr: 70, stats: { pac: 68, sho: 77, pas: 62, dri: 73, def: 36, phy: 64 } },
      { id: 'godden3', name: 'Matt Godden', pos: 'ST', ovr: 70, stats: { pac: 73, sho: 71, pas: 58, dri: 73, def: 35, phy: 66 } }
    ]
  },
  {
    id: 'ipswich',
    name: 'Ipswich Town',
    logo: '🚜',
    squad: [
      { id: 'muric', name: 'Arijanet Murić', pos: 'GK', ovr: 76, stats: { div: 80, han: 75, kic: 68, ref: 78, spd: 30, pos: 76 } },
      { id: 'burns', name: 'Wes Burns', pos: 'RB', ovr: 75, stats: { pac: 81, sho: 54, pas: 70, dri: 77, def: 76, phy: 70 } },
      { id: 'woolfenden', name: 'Cameron Burgess', pos: 'CB', ovr: 75, stats: { pac: 62, sho: 43, pas: 62, dri: 67, def: 84, phy: 72 } },
      { id: 'okumus', name: 'Jacob Greaves', pos: 'CB', ovr: 75, stats: { pac: 72, sho: 39, pas: 66, dri: 64, def: 82, phy: 83 } },
      { id: 'davis_l', name: 'Leif Davis', pos: 'LB', ovr: 76, stats: { pac: 80, sho: 51, pas: 78, dri: 73, def: 78, phy: 75 } },
      { id: 'morsy', name: 'Sam Morsy', pos: 'CDM', ovr: 76, stats: { pac: 65, sho: 64, pas: 76, dri: 70, def: 82, phy: 76 } },
      { id: 'hutchinson_a', name: 'Massimo Luongo', pos: 'CM', ovr: 74, stats: { pac: 64, sho: 66, pas: 78, dri: 77, def: 63, phy: 66 } },
      { id: 'szmodics', name: 'Sammie Szmodics', pos: 'CAM', ovr: 78, stats: { pac: 68, sho: 74, pas: 86, dri: 85, def: 54, phy: 74 } },
      { id: 'chaplin', name: 'Omari Hutchinson', pos: 'RW', ovr: 78, stats: { pac: 83, sho: 74, pas: 71, dri: 89, def: 49, phy: 63 } },
      { id: 'hirst', name: 'George Hirst', pos: 'ST', ovr: 74, stats: { pac: 81, sho: 79, pas: 69, dri: 81, def: 38, phy: 66 } },
      { id: 'delap_l', name: 'Jack Clarke', pos: 'LW', ovr: 76, stats: { pac: 79, sho: 68, pas: 73, dri: 84, def: 39, phy: 69 } },

      { id: 'hladky', name: 'Václav Hladký', pos: 'GK', ovr: 69, stats: { div: 69, han: 65, kic: 58, ref: 75, spd: 30, pos: 69 } },
      { id: 'taylor_j', name: 'Jaden Philogene', pos: 'LW', ovr: 75, stats: { pac: 80, sho: 77, pas: 74, dri: 79, def: 44, phy: 67 } },
      { id: 'phillips_c', name: 'Conor Chaplin', pos: 'CAM', ovr: 74, stats: { pac: 68, sho: 70, pas: 76, dri: 82, def: 47, phy: 64 } },
      { id: 'clarke_c', name: 'Cieran Slicker', pos: 'CM', ovr: 66, stats: { pac: 62, sho: 58, pas: 68, dri: 64, def: 60, phy: 62 } },
      { id: 'edmundson_d', name: 'Dara O\'Shea', pos: 'CB', ovr: 74, stats: { pac: 66, sho: 50, pas: 71, dri: 62, def: 81, phy: 74 } },
      { id: 'davis_kh', name: 'Kalvin Phillips', pos: 'CDM', ovr: 74, stats: { pac: 63, sho: 56, pas: 71, dri: 71, def: 78, phy: 80 } },
      { id: 'ogbene', name: 'Chiedozie Ogbene', pos: 'RW', ovr: 73, stats: { pac: 79, sho: 73, pas: 73, dri: 84, def: 42, phy: 69 } },
      { id: 'burgess2', name: 'Ben Johnson', pos: 'RB', ovr: 71, stats: { pac: 74, sho: 43, pas: 64, dri: 65, def: 71, phy: 70 } },
      { id: 'bonne', name: 'Nathan Broadhead', pos: 'ST', ovr: 72, stats: { pac: 79, sho: 73, pas: 67, dri: 70, def: 39, phy: 70 } }
    ]
  },
  {
    id: 'hull',
    name: 'Hull City',
    logo: '🐯',
    squad: [
      { id: 'ingram', name: 'Ryan Allsop', pos: 'GK', ovr: 73, stats: { div: 75, han: 76, kic: 62, ref: 78, spd: 41, pos: 74 } },
      { id: 'coyle_l', name: 'Liam Millar', pos: 'RB', ovr: 72, stats: { pac: 74, sho: 52, pas: 66, dri: 75, def: 64, phy: 71 } },
      { id: 'greaves_j', name: 'Aidan Connolly', pos: 'CB', ovr: 71, stats: { pac: 68, sho: 36, pas: 65, dri: 57, def: 72, phy: 74 } },
      { id: 'mcloughlin', name: 'Alfie Jones', pos: 'CB', ovr: 73, stats: { pac: 61, sho: 48, pas: 66, dri: 62, def: 76, phy: 75 } },
      { id: 'coyle_j', name: 'Josh Emmanuel', pos: 'LB', ovr: 72, stats: { pac: 72, sho: 45, pas: 68, dri: 70, def: 65, phy: 72 } },
      { id: 'jones_g', name: 'Jean Michaël Seri', pos: 'CDM', ovr: 74, stats: { pac: 64, sho: 64, pas: 77, dri: 66, def: 77, phy: 77 } },
      { id: 'slater_r', name: 'Regan Slater', pos: 'CM', ovr: 73, stats: { pac: 64, sho: 61, pas: 74, dri: 78, def: 66, phy: 70 } },
      { id: 'tutte', name: 'Xavier Simons', pos: 'CM', ovr: 72, stats: { pac: 62, sho: 62, pas: 75, dri: 76, def: 64, phy: 72 } },
      { id: 'honda', name: 'Ozan Tufan', pos: 'CAM', ovr: 74, stats: { pac: 72, sho: 69, pas: 84, dri: 86, def: 52, phy: 66 } },
      { id: 'estupinan_i', name: 'Fábio Carvalho', pos: 'LW', ovr: 75, stats: { pac: 79, sho: 77, pas: 67, dri: 84, def: 43, phy: 70 } },
      { id: 'anthony_o', name: 'Liam Delap', pos: 'ST', ovr: 76, stats: { pac: 80, sho: 84, pas: 63, dri: 72, def: 50, phy: 77 } },

      { id: 'mcdonnell', name: 'Ivor Pandur', pos: 'GK', ovr: 68, stats: { div: 71, han: 70, kic: 59, ref: 73, spd: 33, pos: 70 } },
      { id: 'jones_d', name: 'Charlie Hughes', pos: 'CB', ovr: 71, stats: { pac: 57, sho: 41, pas: 61, dri: 58, def: 77, phy: 74 } },
      { id: 'greaves2', name: 'Cyrus Christie', pos: 'RB', ovr: 70, stats: { pac: 72, sho: 46, pas: 60, dri: 69, def: 62, phy: 64 } },
      { id: 'smith_r', name: 'Ryan Longman', pos: 'RW', ovr: 71, stats: { pac: 76, sho: 75, pas: 61, dri: 81, def: 41, phy: 65 } },
      { id: 'twine_j', name: 'Joe Gelhardt', pos: 'ST', ovr: 71, stats: { pac: 79, sho: 72, pas: 58, dri: 69, def: 37, phy: 67 } },
      { id: 'coyle3', name: 'Jaheim Headley', pos: 'LB', ovr: 70, stats: { pac: 76, sho: 43, pas: 65, dri: 66, def: 67, phy: 65 } },
      { id: 'slater2', name: 'Adama Traoré Jr', pos: 'CM', ovr: 69, stats: { pac: 69, sho: 58, pas: 75, dri: 73, def: 63, phy: 71 } },
      { id: 'docherty_b', name: 'Marcus Forss', pos: 'ST', ovr: 71, stats: { pac: 77, sho: 72, pas: 62, dri: 74, def: 36, phy: 61 } },
      { id: 'kirk', name: 'Owen Beck', pos: 'LB', ovr: 69, stats: { pac: 67, sho: 45, pas: 64, dri: 70, def: 68, phy: 67 } }
    ]
  },
  {
    id: 'atletico_madrid',
    name: 'Atlético Madrid',
    logo: '🔴⚪',
    squad: [
      { id: 'oblak', name: 'Jan Oblak', pos: 'GK', ovr: 87, stats: { div: 86, han: 83, kic: 81, ref: 85, spd: 38, pos: 86 } },
      { id: 'molina', name: 'Nahuel Molina', pos: 'RB', ovr: 80, stats: { pac: 77, sho: 56, pas: 70, dri: 77, def: 73, phy: 69 } },
      { id: 'gimenez', name: 'José Giménez', pos: 'CB', ovr: 82, stats: { pac: 73, sho: 56, pas: 69, dri: 65, def: 88, phy: 89 } },
      { id: 'lenglet', name: 'Clément Lenglet', pos: 'CB', ovr: 78, stats: { pac: 71, sho: 47, pas: 76, dri: 59, def: 86, phy: 77 } },
      { id: 'galan', name: 'Javi Galán', pos: 'LB', ovr: 78, stats: { pac: 76, sho: 49, pas: 72, dri: 80, def: 72, phy: 73 } },
      { id: 'barrios', name: 'Pablo Barrios', pos: 'CDM', ovr: 80, stats: { pac: 72, sho: 64, pas: 79, dri: 69, def: 79, phy: 78 } },
      { id: 'koke', name: 'Koke', pos: 'CM', ovr: 79, stats: { pac: 75, sho: 70, pas: 81, dri: 80, def: 70, phy: 75 } },
      { id: 'de_paul', name: 'Rodrigo De Paul', pos: 'CM', ovr: 82, stats: { pac: 80, sho: 76, pas: 83, dri: 83, def: 74, phy: 85 } },
      { id: 'llorente_m', name: 'Marcos Llorente', pos: 'RM', ovr: 81, stats: { pac: 78, sho: 70, pas: 91, dri: 76, def: 72, phy: 82 } },
      { id: 'griezmann', name: 'Antoine Griezmann', pos: 'CAM', ovr: 86, stats: { pac: 78, sho: 84, pas: 86, dri: 94, def: 65, phy: 79 } },
      { id: 'sorloth', name: 'Alexander Sørloth', pos: 'ST', ovr: 82, stats: { pac: 90, sho: 86, pas: 76, dri: 85, def: 53, phy: 77 } },
      { id: 'sula', name: 'Giuliano Simeone', pos: 'RW', ovr: 76, stats: { pac: 88, sho: 79, pas: 72, dri: 84, def: 39, phy: 68 } },
      { id: 'musso', name: 'Juan Musso', pos: 'GK', ovr: 77, stats: { div: 79, han: 81, kic: 72, ref: 77, spd: 35, pos: 79 } },
      { id: 'hancko', name: 'David Hancko', pos: 'CB', ovr: 80, stats: { pac: 66, sho: 50, pas: 68, dri: 61, def: 79, phy: 85 } },
      { id: 'ruggeri', name: 'Matteo Ruggeri', pos: 'LB', ovr: 76, stats: { pac: 74, sho: 49, pas: 71, dri: 78, def: 69, phy: 69 } },
      { id: 'gallagher', name: 'Conor Gallagher', pos: 'CM', ovr: 79, stats: { pac: 74, sho: 76, pas: 87, dri: 83, def: 68, phy: 76 } },
      { id: 'almada', name: 'Thiago Almada', pos: 'CAM', ovr: 79, stats: { pac: 73, sho: 82, pas: 90, dri: 81, def: 51, phy: 68 } },
      { id: 'julian_alvarez', name: 'Julián Álvarez', pos: 'ST', ovr: 87, stats: { pac: 87, sho: 93, pas: 80, dri: 86, def: 51, phy: 82 } }
    ]
  },
  {
    id: 'athletic_bilbao',
    name: 'Athletic Club',
    logo: '🦁',
    squad: [
      { id: 'simon', name: 'Unai Simón', pos: 'GK', ovr: 84, stats: { div: 84, han: 84, kic: 81, ref: 88, spd: 37, pos: 85 } },
      { id: 'lekue', name: 'Yuri Berchiche', pos: 'LB', ovr: 77, stats: { pac: 81, sho: 48, pas: 78, dri: 78, def: 79, phy: 75 } },
      { id: 'paredes_d', name: 'Dani Vivian', pos: 'CB', ovr: 80, stats: { pac: 71, sho: 49, pas: 67, dri: 68, def: 79, phy: 77 } },
      { id: 'yeray', name: 'Yeray Álvarez', pos: 'CB', ovr: 78, stats: { pac: 67, sho: 44, pas: 68, dri: 59, def: 76, phy: 76 } },
      { id: 'de_marcos', name: 'Óscar de Marcos', pos: 'RB', ovr: 76, stats: { pac: 73, sho: 50, pas: 66, dri: 78, def: 75, phy: 66 } },
      { id: 'vesga', name: 'Mikel Vesga', pos: 'CDM', ovr: 76, stats: { pac: 63, sho: 60, pas: 72, dri: 65, def: 84, phy: 84 } },
      { id: 'ruiz_de_galarreta', name: 'Ruiz de Galarreta', pos: 'CM', ovr: 76, stats: { pac: 70, sho: 68, pas: 75, dri: 71, def: 66, phy: 71 } },
      { id: 'jauregizar', name: 'Jon Jáuregizar', pos: 'CDM', ovr: 78, stats: { pac: 72, sho: 60, pas: 70, dri: 77, def: 82, phy: 76 } },
      { id: 'williams_n2', name: 'Nico Williams', pos: 'LW', ovr: 86, stats: { pac: 95, sho: 78, pas: 82, dri: 95, def: 58, phy: 78 } },
      { id: 'sancet', name: 'Oihan Sancet', pos: 'CAM', ovr: 83, stats: { pac: 76, sho: 79, pas: 85, dri: 92, def: 59, phy: 78 } },
      { id: 'williams_i', name: 'Iñaki Williams', pos: 'ST', ovr: 83, stats: { pac: 84, sho: 86, pas: 79, dri: 91, def: 57, phy: 83 } },
      { id: 'berenguer', name: 'Alex Berenguer', pos: 'RW', ovr: 78, stats: { pac: 90, sho: 79, pas: 71, dri: 84, def: 44, phy: 62 } },
      { id: 'agirrezabala', name: 'Julen Agirrezabala', pos: 'GK', ovr: 74, stats: { div: 70, han: 71, kic: 64, ref: 78, spd: 44, pos: 73 } },
      { id: 'padilla', name: 'Aitor Paredes', pos: 'CB', ovr: 74, stats: { pac: 71, sho: 50, pas: 71, dri: 58, def: 75, phy: 73 } },
      { id: 'galarreta', name: 'Iñigo Lekue', pos: 'RB', ovr: 74, stats: { pac: 72, sho: 46, pas: 71, dri: 77, def: 76, phy: 68 } },
      { id: 'prados', name: 'Beñat Prados', pos: 'CM', ovr: 73, stats: { pac: 69, sho: 69, pas: 72, dri: 75, def: 70, phy: 74 } },
      { id: 'guruzeta', name: 'Gorka Guruzeta', pos: 'ST', ovr: 79, stats: { pac: 85, sho: 85, pas: 67, dri: 84, def: 47, phy: 79 } },
      { id: 'rego', name: 'Adama Boiro', pos: 'ST', ovr: 72, stats: { pac: 81, sho: 77, pas: 63, dri: 79, def: 45, phy: 64 } }
    ]
  },
  {
    id: 'villarreal',
    name: 'Villarreal CF',
    logo: '🟡',
    squad: [
      { id: 'junior_a', name: 'Filip Jörgensen', pos: 'GK', ovr: 76, stats: { div: 73, han: 72, kic: 72, ref: 81, spd: 31, pos: 79 } },
      { id: 'foyth', name: 'Juan Foyth', pos: 'CB', ovr: 80, stats: { pac: 78, sho: 52, pas: 70, dri: 67, def: 80, phy: 76 } },
      { id: 'albiol', name: 'Logan Costa', pos: 'CB', ovr: 78, stats: { pac: 76, sho: 50, pas: 70, dri: 69, def: 81, phy: 84 } },
      { id: 'cardona', name: 'Sergi Cardona', pos: 'LB', ovr: 76, stats: { pac: 82, sho: 49, pas: 69, dri: 72, def: 71, phy: 71 } },
      { id: 'mouriño', name: 'Rafa Mir', pos: 'ST', ovr: 76, stats: { pac: 76, sho: 81, pas: 64, dri: 83, def: 44, phy: 71 } },
      { id: 'comesana', name: 'Santiago Comesaña', pos: 'CDM', ovr: 77, stats: { pac: 68, sho: 68, pas: 74, dri: 76, def: 81, phy: 79 } },
      { id: 'parejo', name: 'Dani Parejo', pos: 'CM', ovr: 80, stats: { pac: 74, sho: 66, pas: 83, dri: 76, def: 66, phy: 82 } },
      { id: 'pape_gueye', name: 'Pape Gueye', pos: 'CDM', ovr: 78, stats: { pac: 64, sho: 64, pas: 79, dri: 73, def: 80, phy: 80 } },
      { id: 'pepe', name: 'Nicolas Pépé', pos: 'RW', ovr: 78, stats: { pac: 87, sho: 79, pas: 69, dri: 85, def: 43, phy: 65 } },
      { id: 'gerard', name: 'Álex Baena', pos: 'CAM', ovr: 83, stats: { pac: 82, sho: 81, pas: 90, dri: 92, def: 64, phy: 74 } },
      { id: 'mikautadze', name: 'Georges Mikautadze', pos: 'ST', ovr: 80, stats: { pac: 84, sho: 86, pas: 72, dri: 84, def: 49, phy: 76 } },
      { id: 'akhomach', name: 'Ilias Akhomach', pos: 'LW', ovr: 77, stats: { pac: 85, sho: 80, pas: 75, dri: 88, def: 50, phy: 64 } },
      { id: 'luiz_junior', name: 'Luiz Júnior', pos: 'GK', ovr: 71, stats: { div: 73, han: 74, kic: 66, ref: 69, spd: 31, pos: 70 } },
      { id: 'kambwala', name: 'Willy Kambwala', pos: 'CB', ovr: 76, stats: { pac: 63, sho: 43, pas: 63, dri: 64, def: 83, phy: 83 } },
      { id: 'costa_j', name: 'Rafa Marín', pos: 'CB', ovr: 75, stats: { pac: 63, sho: 48, pas: 69, dri: 57, def: 84, phy: 83 } },
      { id: 'moleiro', name: 'Alberto Moleiro', pos: 'CAM', ovr: 78, stats: { pac: 71, sho: 81, pas: 83, dri: 84, def: 60, phy: 74 } },
      { id: 'buchanan', name: 'Tajon Buchanan', pos: 'RB', ovr: 76, stats: { pac: 74, sho: 51, pas: 72, dri: 72, def: 70, phy: 68 } }
    ]
  },
  {
    id: 'real_sociedad',
    name: 'Real Sociedad',
    logo: '🔵⚪',
    squad: [
      { id: 'remiro', name: 'Álex Remiro', pos: 'GK', ovr: 82, stats: { div: 85, han: 76, kic: 75, ref: 83, spd: 30, pos: 80 } },
      { id: 'aihen', name: 'Aihen Muñoz', pos: 'LB', ovr: 76, stats: { pac: 79, sho: 52, pas: 67, dri: 80, def: 77, phy: 76 } },
      { id: 'zubeldia', name: 'Igor Zubeldia', pos: 'CB', ovr: 79, stats: { pac: 66, sho: 46, pas: 65, dri: 68, def: 80, phy: 77 } },
      { id: 'martin_zubi', name: 'Jon Aramburu', pos: 'RB', ovr: 76, stats: { pac: 77, sho: 57, pas: 76, dri: 71, def: 70, phy: 75 } },
      { id: 'pacheco', name: 'Diego Rico', pos: 'LB', ovr: 74, stats: { pac: 77, sho: 52, pas: 65, dri: 67, def: 74, phy: 67 } },
      { id: 'zubimendi_r', name: 'Beñat Turrientes', pos: 'CDM', ovr: 76, stats: { pac: 61, sho: 67, pas: 76, dri: 74, def: 75, phy: 82 } },
      { id: 'sucic', name: 'Luka Sučić', pos: 'CM', ovr: 78, stats: { pac: 67, sho: 74, pas: 81, dri: 76, def: 71, phy: 81 } },
      { id: 'gomez_p', name: 'Pablo Marín', pos: 'CM', ovr: 75, stats: { pac: 66, sho: 63, pas: 79, dri: 72, def: 62, phy: 69 } },
      { id: 'kubo', name: 'Take Kubo', pos: 'RW', ovr: 83, stats: { pac: 86, sho: 77, pas: 77, dri: 87, def: 54, phy: 70 } },
      { id: 'oyarzabal', name: 'Mikel Oyarzabal', pos: 'ST', ovr: 84, stats: { pac: 87, sho: 86, pas: 74, dri: 80, def: 51, phy: 74 } },
      { id: 'barrenetxea', name: 'Jon Barrenetxea', pos: 'LW', ovr: 78, stats: { pac: 89, sho: 77, pas: 70, dri: 84, def: 51, phy: 63 } },
      { id: 'sadiq', name: 'Umar Sadiq', pos: 'ST', ovr: 76, stats: { pac: 83, sho: 81, pas: 68, dri: 82, def: 45, phy: 72 } },
      { id: 'marrero', name: 'Unai Marrero', pos: 'GK', ovr: 70, stats: { div: 73, han: 74, kic: 60, ref: 75, spd: 40, pos: 71 } },
      { id: 'gorosabel', name: 'Andoni Gorosabel', pos: 'RB', ovr: 75, stats: { pac: 76, sho: 49, pas: 66, dri: 69, def: 68, phy: 72 } },
      { id: 'traoré_ru', name: 'Sergio Gómez', pos: 'LB', ovr: 76, stats: { pac: 75, sho: 48, pas: 67, dri: 78, def: 78, phy: 72 } },
      { id: 'guedes_m', name: 'Mikel Merino Jr', pos: 'CM', ovr: 74, stats: { pac: 65, sho: 63, pas: 76, dri: 74, def: 62, phy: 71 } },
      { id: 'becker_a', name: 'André Silva', pos: 'ST', ovr: 77, stats: { pac: 77, sho: 89, pas: 75, dri: 80, def: 44, phy: 79 } }
    ]
  },
  {
    id: 'real_betis',
    name: 'Real Betis',
    logo: '🟢⚪',
    squad: [
      { id: 'rui_silva', name: 'Rui Silva', pos: 'GK', ovr: 80, stats: { div: 79, han: 78, kic: 67, ref: 81, spd: 37, pos: 80 } },
      { id: 'bellerin', name: 'Héctor Bellerín', pos: 'RB', ovr: 78, stats: { pac: 76, sho: 54, pas: 68, dri: 73, def: 71, phy: 71 } },
      { id: 'pablo_fornals', name: 'Natan', pos: 'CB', ovr: 78, stats: { pac: 65, sho: 42, pas: 68, dri: 61, def: 83, phy: 80 } },
      { id: 'llorente_diego', name: 'Diego Llorente', pos: 'CB', ovr: 78, stats: { pac: 73, sho: 50, pas: 73, dri: 69, def: 81, phy: 78 } },
      { id: 'miranda_j', name: 'Junior Firpo', pos: 'LB', ovr: 77, stats: { pac: 85, sho: 49, pas: 76, dri: 77, def: 70, phy: 75 } },
      { id: 'vitor_roque', name: 'Marc Roca', pos: 'CDM', ovr: 77, stats: { pac: 72, sho: 65, pas: 78, dri: 75, def: 77, phy: 79 } },
      { id: 'lo_celso', name: 'Giovani Lo Celso', pos: 'CM', ovr: 81, stats: { pac: 75, sho: 77, pas: 89, dri: 85, def: 74, phy: 84 } },
      { id: 'altimira', name: 'Pablo Fornals', pos: 'CM', ovr: 79, stats: { pac: 75, sho: 73, pas: 80, dri: 73, def: 67, phy: 75 } },
      { id: 'antony', name: 'Antony', pos: 'RW', ovr: 80, stats: { pac: 83, sho: 82, pas: 77, dri: 88, def: 50, phy: 72 } },
      { id: 'fekir', name: 'Nabil Fekir', pos: 'CAM', ovr: 81, stats: { pac: 77, sho: 73, pas: 91, dri: 90, def: 57, phy: 73 } },
      { id: 'bakambu', name: 'Cédric Bakambu', pos: 'ST', ovr: 76, stats: { pac: 81, sho: 77, pas: 71, dri: 75, def: 41, phy: 69 } },
      { id: 'ez_abde', name: 'Ez Abde', pos: 'LW', ovr: 77, stats: { pac: 88, sho: 71, pas: 76, dri: 89, def: 45, phy: 66 } },
      { id: 'adrian_betis', name: 'Adrián', pos: 'GK', ovr: 76, stats: { div: 77, han: 77, kic: 71, ref: 79, spd: 39, pos: 72 } },
      { id: 'bartra', name: 'Marc Bartra', pos: 'CB', ovr: 76, stats: { pac: 64, sho: 43, pas: 71, dri: 60, def: 81, phy: 72 } },
      { id: 'ruibal', name: 'Juan Miranda', pos: 'LB', ovr: 76, stats: { pac: 73, sho: 49, pas: 74, dri: 76, def: 76, phy: 67 } },
      { id: 'perraud', name: 'Sergi Altimira', pos: 'CM', ovr: 76, stats: { pac: 70, sho: 68, pas: 80, dri: 71, def: 73, phy: 70 } },
      { id: 'chimy', name: 'Cucho Hernández', pos: 'ST', ovr: 79, stats: { pac: 88, sho: 90, pas: 65, dri: 81, def: 53, phy: 81 } }
    ]
  },
  {
    id: 'sevilla',
    name: 'Sevilla FC',
    logo: '🔴⚪',
    squad: [
      { id: 'vlachodimos', name: 'Ørjan Nyland', pos: 'GK', ovr: 76, stats: { div: 76, han: 73, kic: 65, ref: 82, spd: 32, pos: 77 } },
      { id: 'carmona', name: 'Adrià Pedrosa', pos: 'LB', ovr: 75, stats: { pac: 73, sho: 51, pas: 76, dri: 69, def: 77, phy: 69 } },
      { id: 'marcao', name: 'Kike Salas', pos: 'CB', ovr: 76, stats: { pac: 73, sho: 48, pas: 65, dri: 67, def: 80, phy: 72 } },
      { id: 'nianzou', name: 'Tanguy Nianzou', pos: 'CB', ovr: 77, stats: { pac: 63, sho: 47, pas: 68, dri: 61, def: 77, phy: 77 } },
      { id: 'rekik', name: 'Ramón Martínez', pos: 'RB', ovr: 74, stats: { pac: 74, sho: 54, pas: 64, dri: 75, def: 76, phy: 63 } },
      { id: 'sow', name: 'Djibril Sow', pos: 'CDM', ovr: 77, stats: { pac: 72, sho: 66, pas: 80, dri: 68, def: 79, phy: 78 } },
      { id: 'ejuke', name: 'Nemanja Gudelj', pos: 'CM', ovr: 75, stats: { pac: 75, sho: 68, pas: 77, dri: 74, def: 64, phy: 68 } },
      { id: 'agoume', name: 'Lucien Agoumé', pos: 'CM', ovr: 75, stats: { pac: 64, sho: 71, pas: 76, dri: 80, def: 64, phy: 70 } },
      { id: 'akor_adams', name: 'Akor Adams', pos: 'ST', ovr: 76, stats: { pac: 79, sho: 78, pas: 66, dri: 83, def: 51, phy: 76 } },
      { id: 'lukebakio', name: 'Dodi Lukébakio', pos: 'RW', ovr: 78, stats: { pac: 88, sho: 81, pas: 79, dri: 85, def: 49, phy: 63 } },
      { id: 'romero_a', name: 'Alexis Sánchez', pos: 'ST', ovr: 78, stats: { pac: 84, sho: 83, pas: 73, dri: 82, def: 45, phy: 69 } },
      { id: 'ramon', name: 'José Ángel Carmona', pos: 'RB', ovr: 75, stats: { pac: 82, sho: 47, pas: 71, dri: 71, def: 71, phy: 72 } },
      { id: 'flores_o', name: 'Álvaro Fernández', pos: 'GK', ovr: 71, stats: { div: 77, han: 68, kic: 65, ref: 71, spd: 38, pos: 70 } },
      { id: 'pedrosa', name: 'Loïc Badé', pos: 'CB', ovr: 78, stats: { pac: 66, sho: 44, pas: 66, dri: 69, def: 82, phy: 77 } },
      { id: 'vargas_g', name: 'Chidera Ejuke', pos: 'LW', ovr: 76, stats: { pac: 89, sho: 80, pas: 71, dri: 78, def: 40, phy: 61 } },
      { id: 'gudelj', name: 'Isaac Romero', pos: 'ST', ovr: 75, stats: { pac: 76, sho: 76, pas: 64, dri: 74, def: 46, phy: 76 } },
      { id: 'idumbo', name: 'Juanlu Sánchez', pos: 'RB', ovr: 76, stats: { pac: 81, sho: 51, pas: 71, dri: 74, def: 73, phy: 68 } }
    ]
  },
  {
    id: 'valencia',
    name: 'Valencia CF',
    logo: '⚪⚫',
    squad: [
      { id: 'agirrezabala_j', name: 'Julen Agirrezabala Jr', pos: 'GK', ovr: 79, stats: { div: 76, han: 76, kic: 76, ref: 77, spd: 37, pos: 80 } },
      { id: 'correia', name: 'Thierry Correia', pos: 'RB', ovr: 75, stats: { pac: 81, sho: 48, pas: 68, dri: 70, def: 72, phy: 68 } },
      { id: 'tarrega', name: 'Cristhian Mosquera', pos: 'CB', ovr: 79, stats: { pac: 76, sho: 53, pas: 75, dri: 59, def: 77, phy: 84 } },
      { id: 'diakhaby', name: 'Mouctar Diakhaby', pos: 'CB', ovr: 77, stats: { pac: 74, sho: 47, pas: 70, dri: 57, def: 80, phy: 84 } },
      { id: 'gaya', name: 'José Gayà', pos: 'LB', ovr: 79, stats: { pac: 85, sho: 59, pas: 81, dri: 74, def: 72, phy: 69 } },
      { id: 'guillamon', name: 'Javi Guerra', pos: 'CM', ovr: 79, stats: { pac: 73, sho: 73, pas: 88, dri: 82, def: 73, phy: 80 } },
      { id: 'pepelu', name: 'Pepelu', pos: 'CDM', ovr: 78, stats: { pac: 67, sho: 65, pas: 70, dri: 75, def: 79, phy: 85 } },
      { id: 'barrenechea', name: 'Fran Pérez', pos: 'RW', ovr: 76, stats: { pac: 86, sho: 72, pas: 68, dri: 79, def: 46, phy: 68 } },
      { id: 'duro', name: 'Diego López', pos: 'CAM', ovr: 76, stats: { pac: 67, sho: 69, pas: 82, dri: 83, def: 51, phy: 65 } },
      { id: 'rafa_mir_v', name: 'Hugo Duro', pos: 'ST', ovr: 77, stats: { pac: 81, sho: 77, pas: 67, dri: 79, def: 53, phy: 75 } },
      { id: 'canos', name: 'Jesús Vázquez', pos: 'LW', ovr: 75, stats: { pac: 88, sho: 73, pas: 68, dri: 78, def: 49, phy: 67 } },
      { id: 'lopez_d', name: 'André Almeida', pos: 'RB', ovr: 74, stats: { pac: 74, sho: 44, pas: 70, dri: 74, def: 71, phy: 65 } },
      { id: 'cristo', name: 'Cristo González', pos: 'ST', ovr: 74, stats: { pac: 79, sho: 85, pas: 63, dri: 70, def: 42, phy: 69 } },
      { id: 'copete', name: 'Yarek Gasiorowski', pos: 'CB', ovr: 74, stats: { pac: 68, sho: 40, pas: 70, dri: 63, def: 78, phy: 72 } },
      { id: 'yaremchuk', name: 'Roman Yaremchuk', pos: 'ST', ovr: 76, stats: { pac: 85, sho: 80, pas: 72, dri: 75, def: 43, phy: 75 } },
      { id: 'rioja', name: 'Diego López Valencia', pos: 'RW', ovr: 82, stats: { pac: 88, sho: 85, pas: 78, dri: 84, def: 47, phy: 71 } }
    ]
  },
  {
    id: 'celta_vigo',
    name: 'Celta Vigo',
    logo: '🟢🔵',
    squad: [
      { id: 'ivan_villar', name: 'Iván Villar', pos: 'GK', ovr: 76, stats: { div: 79, han: 79, kic: 64, ref: 77, spd: 32, pos: 81 } },
      { id: 'mingueza', name: 'Óscar Mingueza', pos: 'RB', ovr: 77, stats: { pac: 75, sho: 48, pas: 68, dri: 74, def: 80, phy: 76 } },
      { id: 'starfelt', name: 'Carl Starfelt', pos: 'CB', ovr: 76, stats: { pac: 71, sho: 52, pas: 73, dri: 60, def: 76, phy: 83 } },
      { id: 'nunez_m', name: 'Manu Fernández', pos: 'CB', ovr: 75, stats: { pac: 70, sho: 39, pas: 69, dri: 60, def: 77, phy: 75 } },
      { id: 'rueda', name: 'Álex Domínguez', pos: 'LB', ovr: 75, stats: { pac: 73, sho: 45, pas: 68, dri: 71, def: 78, phy: 64 } },
      { id: 'beltran_h', name: 'Hugo Sotelo', pos: 'CDM', ovr: 75, stats: { pac: 71, sho: 57, pas: 71, dri: 73, def: 83, phy: 76 } },
      { id: 'sotelo', name: 'Fer López', pos: 'CM', ovr: 78, stats: { pac: 67, sho: 70, pas: 80, dri: 83, def: 66, phy: 74 } },
      { id: 'moriba', name: 'Ilaix Moriba', pos: 'CM', ovr: 77, stats: { pac: 76, sho: 63, pas: 80, dri: 81, def: 72, phy: 69 } },
      { id: 'aspas', name: 'Iago Aspas', pos: 'ST', ovr: 82, stats: { pac: 79, sho: 83, pas: 79, dri: 81, def: 55, phy: 83 } },
      { id: 'bamba', name: 'Sergio Carreira', pos: 'RW', ovr: 74, stats: { pac: 80, sho: 69, pas: 75, dri: 81, def: 39, phy: 67 } },
      { id: 'douvikas', name: 'Anastasios Douvikas', pos: 'ST', ovr: 76, stats: { pac: 77, sho: 79, pas: 62, dri: 81, def: 51, phy: 74 } },
      { id: 'mingo', name: 'Javi Rueda', pos: 'LB', ovr: 74, stats: { pac: 81, sho: 44, pas: 67, dri: 72, def: 77, phy: 73 } },
      { id: 'radu', name: 'Marian Radu', pos: 'GK', ovr: 68, stats: { div: 68, han: 65, kic: 59, ref: 70, spd: 44, pos: 65 } },
      { id: 'starf2', name: 'Jones El-Abdellaoui', pos: 'CB', ovr: 73, stats: { pac: 69, sho: 46, pas: 69, dri: 62, def: 78, phy: 73 } },
      { id: 'swedberg', name: 'Williot Swedberg', pos: 'CAM', ovr: 77, stats: { pac: 71, sho: 73, pas: 86, dri: 78, def: 49, phy: 72 } },
      { id: 'durán_p', name: 'Pablo Durán', pos: 'ST', ovr: 74, stats: { pac: 74, sho: 75, pas: 60, dri: 77, def: 42, phy: 76 } }
    ]
  },
  {
    id: 'rayo_vallecano',
    name: 'Rayo Vallecano',
    logo: '⚪🔴',
    squad: [
      { id: 'batalla', name: 'Augusto Batalla', pos: 'GK', ovr: 76, stats: { div: 81, han: 80, kic: 66, ref: 74, spd: 31, pos: 76 } },
      { id: 'lejeune', name: 'Florian Lejeune', pos: 'CB', ovr: 76, stats: { pac: 71, sho: 45, pas: 65, dri: 61, def: 81, phy: 80 } },
      { id: 'mumin', name: 'Abdul Mumin', pos: 'CB', ovr: 76, stats: { pac: 71, sho: 50, pas: 70, dri: 57, def: 84, phy: 76 } },
      { id: 'balliu', name: 'Andrei Ratiu', pos: 'RB', ovr: 76, stats: { pac: 79, sho: 50, pas: 75, dri: 70, def: 71, phy: 67 } },
      { id: 'lopez_p', name: 'Pep Chavarría', pos: 'LB', ovr: 74, stats: { pac: 72, sho: 55, pas: 71, dri: 70, def: 71, phy: 74 } },
      { id: 'valentin', name: 'Óscar Valentín', pos: 'CDM', ovr: 76, stats: { pac: 66, sho: 59, pas: 78, dri: 72, def: 86, phy: 73 } },
      { id: 'ciss', name: 'Pathé Ciss', pos: 'CM', ovr: 76, stats: { pac: 70, sho: 72, pas: 84, dri: 81, def: 62, phy: 72 } },
      { id: 'de_frutos', name: 'Isi Palazón', pos: 'RW', ovr: 78, stats: { pac: 81, sho: 72, pas: 80, dri: 85, def: 51, phy: 66 } },
      { id: 'garcia_alvaro', name: 'Álvaro García', pos: 'LW', ovr: 77, stats: { pac: 89, sho: 74, pas: 70, dri: 86, def: 50, phy: 62 } },
      { id: 'trejo', name: 'Óscar Trejo', pos: 'CAM', ovr: 77, stats: { pac: 74, sho: 76, pas: 80, dri: 81, def: 49, phy: 65 } },
      { id: 'camello', name: 'Randy Nteka', pos: 'ST', ovr: 76, stats: { pac: 76, sho: 83, pas: 70, dri: 74, def: 40, phy: 70 } },
      { id: 'nteka', name: 'Jorge de Frutos', pos: 'RM', ovr: 76, stats: { pac: 72, sho: 64, pas: 78, dri: 72, def: 72, phy: 75 } },
      { id: 'dimitrievski', name: 'Stole Dimitrievski', pos: 'GK', ovr: 76, stats: { div: 73, han: 71, kic: 67, ref: 79, spd: 39, pos: 72 } },
      { id: 'cuenca_r', name: 'Fran García Torres', pos: 'LB', ovr: 73, stats: { pac: 71, sho: 51, pas: 68, dri: 68, def: 69, phy: 72 } },
      { id: 'nteka2', name: 'Sergio Camello', pos: 'ST', ovr: 77, stats: { pac: 78, sho: 84, pas: 67, dri: 78, def: 51, phy: 79 } }
    ]
  },
  {
    id: 'osasuna',
    name: 'CA Osasuna',
    logo: '🔴',
    squad: [
      { id: 'herrera_s', name: 'Sergio Herrera', pos: 'GK', ovr: 77, stats: { div: 77, han: 73, kic: 71, ref: 76, spd: 30, pos: 81 } },
      { id: 'herrando', name: 'Alejandro Catena', pos: 'CB', ovr: 76, stats: { pac: 67, sho: 50, pas: 67, dri: 67, def: 80, phy: 74 } },
      { id: 'bove', name: 'David García', pos: 'CB', ovr: 76, stats: { pac: 62, sho: 47, pas: 70, dri: 67, def: 75, phy: 79 } },
      { id: 'boyomo', name: 'Juan Cruz', pos: 'RB', ovr: 75, stats: { pac: 75, sho: 51, pas: 67, dri: 70, def: 73, phy: 74 } },
      { id: 'vidal', name: 'Jesús Areso', pos: 'LB', ovr: 75, stats: { pac: 72, sho: 51, pas: 75, dri: 79, def: 69, phy: 65 } },
      { id: 'moncayola', name: 'Jon Moncayola', pos: 'CDM', ovr: 78, stats: { pac: 73, sho: 70, pas: 76, dri: 67, def: 87, phy: 79 } },
      { id: 'torro', name: 'Rubén García', pos: 'CM', ovr: 76, stats: { pac: 75, sho: 69, pas: 84, dri: 72, def: 71, phy: 71 } },
      { id: 'gomez_a', name: 'Aimar Oroz', pos: 'CAM', ovr: 78, stats: { pac: 73, sho: 80, pas: 88, dri: 80, def: 51, phy: 69 } },
      { id: 'budimir', name: 'Ante Budimir', pos: 'ST', ovr: 80, stats: { pac: 83, sho: 85, pas: 67, dri: 79, def: 53, phy: 81 } },
      { id: 'avila', name: 'Bryan Zaragoza', pos: 'RW', ovr: 76, stats: { pac: 78, sho: 75, pas: 75, dri: 76, def: 48, phy: 61 } },
      { id: 'kike_garcia', name: 'Kike García', pos: 'ST', ovr: 75, stats: { pac: 79, sho: 82, pas: 69, dri: 75, def: 44, phy: 72 } },
      { id: 'sanchez_a', name: 'Abde Rebbach', pos: 'LW', ovr: 76, stats: { pac: 83, sho: 76, pas: 71, dri: 81, def: 38, phy: 67 } },
      { id: 'fernandez_i', name: 'Iñaki Peña Jr', pos: 'GK', ovr: 68, stats: { div: 69, han: 64, kic: 63, ref: 73, spd: 36, pos: 65 } },
      { id: 'cruz_j', name: 'Jorge Herrando', pos: 'CB', ovr: 74, stats: { pac: 66, sho: 39, pas: 62, dri: 59, def: 73, phy: 75 } },
      { id: 'garcia_moi', name: 'Moi Gómez', pos: 'CM', ovr: 76, stats: { pac: 70, sho: 62, pas: 82, dri: 71, def: 71, phy: 77 } }
    ]
  },
  {
    id: 'getafe',
    name: 'Getafe CF',
    logo: '🔵',
    squad: [
      { id: 'soria', name: 'David Soria', pos: 'GK', ovr: 78, stats: { div: 79, han: 73, kic: 70, ref: 79, spd: 44, pos: 74 } },
      { id: 'duarte', name: 'Domingos Duarte', pos: 'CB', ovr: 77, stats: { pac: 73, sho: 53, pas: 72, dri: 67, def: 77, phy: 85 } },
      { id: 'djene', name: 'Djené Dakonam', pos: 'CB', ovr: 78, stats: { pac: 70, sho: 53, pas: 75, dri: 60, def: 85, phy: 85 } },
      { id: 'rico', name: 'Diego Rico Getafe', pos: 'LB', ovr: 74, stats: { pac: 71, sho: 48, pas: 73, dri: 68, def: 77, phy: 65 } },
      { id: 'suarez_j', name: 'Juanmi Latasa', pos: 'ST', ovr: 76, stats: { pac: 83, sho: 78, pas: 68, dri: 83, def: 42, phy: 69 } },
      { id: 'arambarri', name: 'Mauro Arambarri', pos: 'CDM', ovr: 78, stats: { pac: 68, sho: 62, pas: 70, dri: 68, def: 78, phy: 85 } },
      { id: 'milla', name: 'Luis Milla', pos: 'CM', ovr: 76, stats: { pac: 72, sho: 73, pas: 76, dri: 79, def: 63, phy: 74 } },
      { id: 'mayoral', name: 'Borja Mayoral', pos: 'ST', ovr: 78, stats: { pac: 83, sho: 82, pas: 74, dri: 81, def: 49, phy: 79 } },
      { id: 'liso', name: 'Jaime Mata', pos: 'RW', ovr: 74, stats: { pac: 77, sho: 78, pas: 72, dri: 79, def: 46, phy: 61 } },
      { id: 'alderete2', name: 'Alderete', pos: 'CB', ovr: 76, stats: { pac: 74, sho: 47, pas: 66, dri: 65, def: 79, phy: 74 } },
      { id: 'nyom', name: 'Allan Nyom', pos: 'RB', ovr: 73, stats: { pac: 78, sho: 44, pas: 73, dri: 68, def: 73, phy: 73 } },
      { id: 'greenwood', name: 'Mason Greenwood II', pos: 'RW', ovr: 74, stats: { pac: 83, sho: 74, pas: 68, dri: 74, def: 36, phy: 60 } },
      { id: 'bergara', name: 'Domenico Bergara', pos: 'GK', ovr: 66, stats: { div: 68, han: 64, kic: 58, ref: 72, spd: 31, pos: 63 } },
      { id: 'rico2', name: 'Álex Sancris', pos: 'LB', ovr: 72, stats: { pac: 76, sho: 42, pas: 62, dri: 68, def: 65, phy: 64 } },
      { id: 'latasa', name: 'Coba da Costa', pos: 'CM', ovr: 73, stats: { pac: 64, sho: 66, pas: 78, dri: 69, def: 66, phy: 71 } }
    ]
  },
  {
    id: 'alaves',
    name: 'Deportivo Alavés',
    logo: '🔵⚪',
    squad: [
      { id: 'sivera', name: 'Antonio Sivera', pos: 'GK', ovr: 77, stats: { div: 74, han: 80, kic: 66, ref: 75, spd: 31, pos: 78 } },
      { id: 'tenaglia', name: 'Nahuel Tenaglia', pos: 'CB', ovr: 75, stats: { pac: 71, sho: 48, pas: 66, dri: 58, def: 73, phy: 79 } },
      { id: 'abqar', name: 'Abdel Abqar', pos: 'CB', ovr: 75, stats: { pac: 68, sho: 43, pas: 69, dri: 60, def: 84, phy: 80 } },
      { id: 'rioja_a', name: 'Manu Sánchez', pos: 'LB', ovr: 75, stats: { pac: 74, sho: 56, pas: 66, dri: 73, def: 72, phy: 66 } },
      { id: 'vicente', name: 'Jonny Otto', pos: 'RB', ovr: 76, stats: { pac: 73, sho: 55, pas: 66, dri: 75, def: 79, phy: 66 } },
      { id: 'guridi', name: 'Antonio Blanco', pos: 'CDM', ovr: 76, stats: { pac: 62, sho: 63, pas: 74, dri: 72, def: 84, phy: 74 } },
      { id: 'kike_perez', name: 'Kike Pérez', pos: 'CM', ovr: 76, stats: { pac: 68, sho: 66, pas: 75, dri: 81, def: 71, phy: 77 } },
      { id: 'boye', name: 'Toni Martínez', pos: 'ST', ovr: 75, stats: { pac: 72, sho: 85, pas: 70, dri: 77, def: 48, phy: 70 } },
      { id: 'guevara', name: 'Carlos Vicente', pos: 'RW', ovr: 76, stats: { pac: 81, sho: 69, pas: 69, dri: 76, def: 42, phy: 69 } },
      { id: 'luis_rioja', name: 'Luis Rioja', pos: 'LW', ovr: 77, stats: { pac: 87, sho: 79, pas: 76, dri: 80, def: 46, phy: 66 } },
      { id: 'sekou', name: 'Kike García Alavés', pos: 'ST', ovr: 74, stats: { pac: 80, sho: 80, pas: 63, dri: 78, def: 50, phy: 67 } },
      { id: 'duarte_a', name: 'Diego Álvarez', pos: 'RB', ovr: 73, stats: { pac: 80, sho: 43, pas: 66, dri: 68, def: 74, phy: 72 } },
      { id: 'dituro', name: 'Antonio Sivera Jr', pos: 'GK', ovr: 65, stats: { div: 68, han: 62, kic: 61, ref: 65, spd: 33, pos: 69 } },
      { id: 'carlos_vicente', name: 'Rúben Duarte', pos: 'CB', ovr: 75, stats: { pac: 69, sho: 47, pas: 69, dri: 67, def: 79, phy: 81 } },
      { id: 'martinez_p', name: 'Pablo Ibáñez', pos: 'CM', ovr: 73, stats: { pac: 69, sho: 69, pas: 76, dri: 76, def: 66, phy: 69 } }
    ]
  },
  {
    id: 'espanyol',
    name: 'RCD Espanyol',
    logo: '🔵⚪',
    squad: [
      { id: 'dmitrovic', name: 'Marko Dmitrović', pos: 'GK', ovr: 78, stats: { div: 76, han: 78, kic: 66, ref: 84, spd: 31, pos: 73 } },
      { id: 'calero', name: 'Omar El Hilali', pos: 'CB', ovr: 74, stats: { pac: 61, sho: 49, pas: 64, dri: 56, def: 72, phy: 70 } },
      { id: 'leandro_cabrera', name: 'Leandro Cabrera', pos: 'CB', ovr: 76, stats: { pac: 70, sho: 48, pas: 70, dri: 65, def: 75, phy: 79 } },
      { id: 'pedrosa_a', name: 'Alejandro Pomares', pos: 'LB', ovr: 74, stats: { pac: 74, sho: 54, pas: 74, dri: 77, def: 67, phy: 72 } },
      { id: 'lozano_a', name: 'Jofre Carreras', pos: 'RW', ovr: 76, stats: { pac: 89, sho: 79, pas: 67, dri: 78, def: 39, phy: 60 } },
      { id: 'exposito', name: 'Pol Lozano', pos: 'CM', ovr: 75, stats: { pac: 73, sho: 71, pas: 81, dri: 79, def: 69, phy: 70 } },
      { id: 'urko', name: 'Urko González', pos: 'CDM', ovr: 75, stats: { pac: 60, sho: 56, pas: 76, dri: 65, def: 77, phy: 76 } },
      { id: 'puado', name: 'Javi Puado', pos: 'ST', ovr: 78, stats: { pac: 75, sho: 81, pas: 67, dri: 83, def: 46, phy: 72 } },
      { id: 'roca_e', name: 'Álex Kral', pos: 'CM', ovr: 75, stats: { pac: 75, sho: 67, pas: 83, dri: 76, def: 61, phy: 72 } },
      { id: 'carreras_j', name: 'Kike García Espanyol', pos: 'ST', ovr: 74, stats: { pac: 76, sho: 83, pas: 64, dri: 78, def: 44, phy: 67 } },
      { id: 'romero_e', name: 'Miguel Rubio', pos: 'CB', ovr: 73, stats: { pac: 69, sho: 38, pas: 69, dri: 55, def: 71, phy: 71 } },
      { id: 'cabrera', name: 'Fernando Calero', pos: 'CB', ovr: 74, stats: { pac: 69, sho: 50, pas: 60, dri: 60, def: 78, phy: 80 } },
      { id: 'fort', name: 'Joan García Jr', pos: 'GK', ovr: 66, stats: { div: 64, han: 65, kic: 56, ref: 71, spd: 33, pos: 70 } },
      { id: 'kral', name: 'Tyrhys Dolan', pos: 'RW', ovr: 74, stats: { pac: 79, sho: 69, pas: 72, dri: 80, def: 37, phy: 66 } },
      { id: 'puado2', name: 'Roberto Fernández', pos: 'ST', ovr: 72, stats: { pac: 70, sho: 81, pas: 66, dri: 77, def: 44, phy: 66 } }
    ]
  },
  {
    id: 'las_palmas',
    name: 'UD Las Palmas',
    logo: '🟡⚪',
    squad: [
      { id: 'cillessen', name: 'Álvaro Valles', pos: 'GK', ovr: 76, stats: { div: 76, han: 74, kic: 72, ref: 74, spd: 43, pos: 71 } },
      { id: 'sandro_r', name: 'Sandro Ramírez', pos: 'ST', ovr: 75, stats: { pac: 74, sho: 78, pas: 72, dri: 77, def: 44, phy: 76 } },
      { id: 'marmol', name: 'Saúl Coco', pos: 'CB', ovr: 76, stats: { pac: 65, sho: 46, pas: 68, dri: 65, def: 83, phy: 80 } },
      { id: 'herrera_j', name: 'Vitolo Herrera', pos: 'LB', ovr: 74, stats: { pac: 74, sho: 48, pas: 66, dri: 76, def: 74, phy: 71 } },
      { id: 'suarez_p', name: 'Álex Suárez', pos: 'CB', ovr: 76, stats: { pac: 64, sho: 45, pas: 71, dri: 63, def: 76, phy: 78 } },
      { id: 'mendez', name: 'Mika Mármol', pos: 'CB', ovr: 75, stats: { pac: 72, sho: 42, pas: 63, dri: 59, def: 81, phy: 81 } },
      { id: 'munoz_e', name: 'Enzo Loiodice', pos: 'CDM', ovr: 74, stats: { pac: 60, sho: 56, pas: 69, dri: 66, def: 78, phy: 72 } },
      { id: 'kirian', name: 'Kirian Rodríguez', pos: 'CM', ovr: 75, stats: { pac: 67, sho: 63, pas: 85, dri: 78, def: 62, phy: 79 } },
      { id: 'moleiro_a', name: 'Alberto Moleiro Jr', pos: 'CAM', ovr: 76, stats: { pac: 67, sho: 73, pas: 88, dri: 86, def: 55, phy: 67 } },
      { id: 'marc_cardona', name: 'Marc Cardona', pos: 'ST', ovr: 75, stats: { pac: 74, sho: 83, pas: 62, dri: 73, def: 44, phy: 65 } },
      { id: 'fabio_silva', name: 'Fábio Silva', pos: 'ST', ovr: 76, stats: { pac: 78, sho: 85, pas: 70, dri: 78, def: 48, phy: 72 } },
      { id: 'rodriguez_k', name: 'Kirian Jr', pos: 'RW', ovr: 73, stats: { pac: 77, sho: 72, pas: 68, dri: 82, def: 46, phy: 62 } },
      { id: 'cillessen2', name: 'Aday Benítez', pos: 'GK', ovr: 65, stats: { div: 67, han: 66, kic: 56, ref: 64, spd: 41, pos: 69 } },
      { id: 'coco_s', name: 'Julio Alonso', pos: 'RB', ovr: 72, stats: { pac: 77, sho: 50, pas: 72, dri: 72, def: 72, phy: 65 } },
      { id: 'loiodice', name: 'Munir El Haddadi', pos: 'LW', ovr: 76, stats: { pac: 82, sho: 76, pas: 67, dri: 81, def: 47, phy: 69 } }
    ]
  },
  {
    id: 'levante',
    name: 'Levante UD',
    logo: '🔵🔴',
    squad: [
      { id: 'cardenas', name: 'Xavier Dieguez', pos: 'GK', ovr: 74, stats: { div: 76, han: 71, kic: 65, ref: 76, spd: 39, pos: 73 } },
      { id: 'gonzalez_g', name: 'Carlos Álvarez', pos: 'CB', ovr: 73, stats: { pac: 67, sho: 48, pas: 61, dri: 61, def: 80, phy: 74 } },
      { id: 'elgezabal', name: 'Unai Elgezabal', pos: 'CB', ovr: 73, stats: { pac: 65, sho: 49, pas: 59, dri: 60, def: 73, phy: 78 } },
      { id: 'perez_j', name: 'Julián Chust', pos: 'RB', ovr: 73, stats: { pac: 80, sho: 49, pas: 64, dri: 72, def: 71, phy: 70 } },
      { id: 'doumbia', name: 'Adrián Butzke', pos: 'LB', ovr: 73, stats: { pac: 75, sho: 51, pas: 73, dri: 71, def: 70, phy: 72 } },
      { id: 'romero_j', name: 'Kervin Andrade', pos: 'CM', ovr: 74, stats: { pac: 65, sho: 68, pas: 77, dri: 77, def: 61, phy: 78 } },
      { id: 'sema', name: 'Sergio Sánchez', pos: 'CDM', ovr: 73, stats: { pac: 61, sho: 54, pas: 68, dri: 66, def: 71, phy: 74 } },
      { id: 'etta_eyong', name: 'Etta Eyong', pos: 'ST', ovr: 75, stats: { pac: 77, sho: 83, pas: 65, dri: 74, def: 42, phy: 74 } },
      { id: 'perez_c', name: 'Carlos Pérez', pos: 'RW', ovr: 74, stats: { pac: 87, sho: 72, pas: 67, dri: 84, def: 41, phy: 61 } },
      { id: 'iban_salvador', name: 'Iván Romero', pos: 'LW', ovr: 74, stats: { pac: 78, sho: 75, pas: 74, dri: 82, def: 42, phy: 65 } },
      { id: 'nakamura', name: 'Jorge de Frutos Jr', pos: 'ST', ovr: 73, stats: { pac: 73, sho: 85, pas: 63, dri: 77, def: 47, phy: 73 } },
      { id: 'dela', name: 'José Campaña', pos: 'CM', ovr: 74, stats: { pac: 68, sho: 64, pas: 79, dri: 70, def: 70, phy: 70 } },
      { id: 'rodri_l', name: 'Dani Cárdenas', pos: 'GK', ovr: 64, stats: { div: 69, han: 61, kic: 55, ref: 64, spd: 36, pos: 61 } },
      { id: 'vencedor', name: 'Elady Zorrilla', pos: 'ST', ovr: 72, stats: { pac: 69, sho: 81, pas: 61, dri: 71, def: 40, phy: 68 } },
      { id: 'kervin', name: 'Pablo Martínez', pos: 'CB', ovr: 71, stats: { pac: 62, sho: 43, pas: 65, dri: 55, def: 80, phy: 77 } }
    ]
  },
  {
    id: 'racing_santander',
    name: 'Racing Santander',
    logo: '🟢⚪',
    squad: [
      { id: 'mackay', name: 'Ander Cantero', pos: 'GK', ovr: 73, stats: { div: 70, han: 75, kic: 69, ref: 78, spd: 31, pos: 76 } },
      { id: 'mendoza_r', name: 'Íñigo Vicente', pos: 'RW', ovr: 75, stats: { pac: 85, sho: 67, pas: 65, dri: 86, def: 45, phy: 62 } },
      { id: 'gonzalez_a', name: 'Álex Pérez', pos: 'CB', ovr: 73, stats: { pac: 60, sho: 39, pas: 62, dri: 62, def: 75, phy: 71 } },
      { id: 'unai_vencedor', name: 'Unai Vencedor', pos: 'CDM', ovr: 74, stats: { pac: 69, sho: 64, pas: 68, dri: 73, def: 79, phy: 79 } },
      { id: 'villalibre', name: 'Aritz Arambarri', pos: 'CB', ovr: 72, stats: { pac: 66, sho: 47, pas: 67, dri: 62, def: 72, phy: 76 } },
      { id: 'cristian_herrera', name: 'Jeison Murillo', pos: 'CB', ovr: 73, stats: { pac: 65, sho: 46, pas: 64, dri: 64, def: 78, phy: 72 } },
      { id: 'robert_gonzalez', name: 'Robert González', pos: 'RW', ovr: 74, stats: { pac: 79, sho: 68, pas: 70, dri: 75, def: 42, phy: 60 } },
      { id: 'pablo_perez', name: 'Pablo Pérez', pos: 'CM', ovr: 72, stats: { pac: 66, sho: 64, pas: 76, dri: 76, def: 58, phy: 74 } },
      { id: 'villaba', name: 'Iñigo Vicente Jr', pos: 'LW', ovr: 73, stats: { pac: 81, sho: 72, pas: 71, dri: 83, def: 39, phy: 62 } },
      { id: 'yeboah', name: 'Jokin Ezkieta', pos: 'GK', ovr: 68, stats: { div: 74, han: 63, kic: 61, ref: 71, spd: 30, pos: 69 } },
      { id: 'george', name: 'Kike García Racing', pos: 'ST', ovr: 73, stats: { pac: 78, sho: 84, pas: 63, dri: 81, def: 43, phy: 69 } },
      { id: 'mario_garcia', name: 'Mario García', pos: 'CM', ovr: 71, stats: { pac: 70, sho: 57, pas: 78, dri: 73, def: 61, phy: 73 } },
      { id: 'christian_rivera', name: 'Andrés Martín', pos: 'RW', ovr: 73, stats: { pac: 79, sho: 71, pas: 69, dri: 82, def: 38, phy: 62 } }
    ]
  },
  {
    id: 'deportivo_coruna',
    name: 'Deportivo La Coruña',
    logo: '🔵⚪',
    squad: [
      { id: 'dieguez', name: 'Ian Mackay', pos: 'GK', ovr: 73, stats: { div: 73, han: 73, kic: 68, ref: 73, spd: 42, pos: 72 } },
      { id: 'bilal', name: 'Yeremay Hernández', pos: 'RW', ovr: 76, stats: { pac: 84, sho: 71, pas: 72, dri: 88, def: 46, phy: 70 } },
      { id: 'mella', name: 'Mario Soriano', pos: 'CM', ovr: 73, stats: { pac: 65, sho: 63, pas: 75, dri: 74, def: 67, phy: 74 } },
      { id: 'lopez_a', name: 'David Mella', pos: 'LW', ovr: 74, stats: { pac: 76, sho: 75, pas: 75, dri: 81, def: 37, phy: 62 } },
      { id: 'lapeña', name: 'Antonio Lapeña', pos: 'CB', ovr: 73, stats: { pac: 59, sho: 39, pas: 70, dri: 60, def: 79, phy: 78 } },
      { id: 'villares', name: 'Yoel Lago', pos: 'CB', ovr: 72, stats: { pac: 69, sho: 43, pas: 65, dri: 60, def: 78, phy: 75 } },
      { id: 'barcia', name: 'Alberto Barcia', pos: 'RB', ovr: 72, stats: { pac: 76, sho: 45, pas: 70, dri: 69, def: 73, phy: 61 } },
      { id: 'lucas_perez', name: 'Lucas Pérez', pos: 'ST', ovr: 76, stats: { pac: 75, sho: 76, pas: 71, dri: 83, def: 48, phy: 70 } },
      { id: 'lois_abad', name: 'Lois Abad', pos: 'CDM', ovr: 71, stats: { pac: 65, sho: 60, pas: 70, dri: 62, def: 73, phy: 72 } },
      { id: 'sotres', name: 'Yeremay Jr', pos: 'CAM', ovr: 72, stats: { pac: 66, sho: 69, pas: 80, dri: 83, def: 43, phy: 65 } },
      { id: 'helton_leite', name: 'Helton Leite', pos: 'GK', ovr: 68, stats: { div: 64, han: 63, kic: 63, ref: 71, spd: 44, pos: 67 } },
      { id: 'bores', name: 'Marcos Bares', pos: 'CB', ovr: 71, stats: { pac: 57, sho: 40, pas: 64, dri: 62, def: 81, phy: 73 } },
      { id: 'trilles', name: 'Fer Trilles', pos: 'CM', ovr: 71, stats: { pac: 64, sho: 58, pas: 77, dri: 68, def: 59, phy: 63 } }
    ]
  },
  {
    id: 'malaga',
    name: 'Málaga CF',
    logo: '🔵⚪',
    squad: [
      { id: 'dani_martin', name: 'Alfonso Herrero', pos: 'GK', ovr: 72, stats: { div: 68, han: 73, kic: 60, ref: 79, spd: 30, pos: 76 } },
      { id: 'sanchez_a2', name: 'Antoñito Cordero', pos: 'RB', ovr: 71, stats: { pac: 69, sho: 41, pas: 70, dri: 66, def: 72, phy: 61 } },
      { id: 'febas', name: 'Manu Molina', pos: 'CM', ovr: 72, stats: { pac: 61, sho: 67, pas: 79, dri: 76, def: 67, phy: 65 } },
      { id: 'haitam', name: 'Haitam Aarab', pos: 'CB', ovr: 71, stats: { pac: 65, sho: 44, pas: 63, dri: 62, def: 72, phy: 79 } },
      { id: 'escassi', name: 'Antonio Escassi', pos: 'CDM', ovr: 72, stats: { pac: 65, sho: 52, pas: 64, dri: 68, def: 80, phy: 69 } },
      { id: 'brasa', name: 'Roberto Brasa', pos: 'RW', ovr: 72, stats: { pac: 78, sho: 73, pas: 64, dri: 82, def: 40, phy: 57 } },
      { id: 'dioni', name: 'Dioni Villalba', pos: 'ST', ovr: 74, stats: { pac: 75, sho: 81, pas: 65, dri: 78, def: 40, phy: 74 } },
      { id: 'genaro', name: 'Genaro Rodríguez', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 43, pas: 65, dri: 56, def: 74, phy: 76 } },
      { id: 'lobete', name: 'Alex Bernal', pos: 'LB', ovr: 70, stats: { pac: 77, sho: 49, pas: 67, dri: 66, def: 63, phy: 70 } },
      { id: 'juande', name: 'Juande Rivas', pos: 'CM', ovr: 70, stats: { pac: 66, sho: 66, pas: 72, dri: 71, def: 68, phy: 72 } },
      { id: 'kevin_medina', name: 'Kevin Medina', pos: 'RB', ovr: 70, stats: { pac: 73, sho: 44, pas: 65, dri: 73, def: 67, phy: 66 } },
      { id: 'herrero', name: 'Adrián Niño', pos: 'ST', ovr: 72, stats: { pac: 76, sho: 83, pas: 68, dri: 71, def: 36, phy: 65 } }
    ]
  },
  {
    id: 'dortmund',
    name: 'Borussia Dortmund',
    logo: '🟡⚫',
    squad: [
      { id: 'kobel', name: 'Gregor Kobel', pos: 'GK', ovr: 85, stats: { div: 85, han: 85, kic: 80, ref: 91, spd: 30, pos: 88 } },
      { id: 'ryerson', name: 'Julian Ryerson', pos: 'RB', ovr: 78, stats: { pac: 84, sho: 58, pas: 75, dri: 73, def: 80, phy: 76 } },
      { id: 'schlotterbeck', name: 'Nico Schlotterbeck', pos: 'CB', ovr: 84, stats: { pac: 78, sho: 59, pas: 74, dri: 65, def: 89, phy: 90 } },
      { id: 'anton', name: 'Waldemar Anton', pos: 'CB', ovr: 79, stats: { pac: 67, sho: 52, pas: 76, dri: 62, def: 84, phy: 83 } },
      { id: 'svensson', name: 'Ramy Bensebaini', pos: 'LB', ovr: 79, stats: { pac: 81, sho: 51, pas: 72, dri: 80, def: 80, phy: 73 } },
      { id: 'groß', name: 'Pascal Groß', pos: 'CDM', ovr: 79, stats: { pac: 64, sho: 69, pas: 80, dri: 70, def: 84, phy: 86 } },
      { id: 'nmecha_f', name: 'Felix Nmecha', pos: 'CM', ovr: 80, stats: { pac: 79, sho: 72, pas: 84, dri: 81, def: 68, phy: 74 } },
      { id: 'brandt', name: 'Julian Brandt', pos: 'CAM', ovr: 82, stats: { pac: 74, sho: 82, pas: 86, dri: 89, def: 57, phy: 74 } },
      { id: 'moukoko', name: 'Youssoufa Moukoko', pos: 'RW', ovr: 82, stats: { pac: 86, sho: 75, pas: 84, dri: 86, def: 45, phy: 74 } },
      { id: 'gittens_j', name: 'Jamie Bynoe-Gittens', pos: 'LW', ovr: 80, stats: { pac: 91, sho: 74, pas: 77, dri: 84, def: 48, phy: 64 } },
      { id: 'guirassy', name: 'Serhou Guirassy', pos: 'ST', ovr: 84, stats: { pac: 81, sho: 95, pas: 80, dri: 86, def: 55, phy: 77 } },
      { id: 'beier', name: 'Maximilian Beier', pos: 'ST', ovr: 78, stats: { pac: 84, sho: 83, pas: 75, dri: 83, def: 52, phy: 80 } },
      { id: 'meyer_a', name: 'Alexander Meyer', pos: 'GK', ovr: 72, stats: { div: 71, han: 66, kic: 61, ref: 71, spd: 30, pos: 68 } },
      { id: 'sule', name: 'Niklas Süle', pos: 'CB', ovr: 79, stats: { pac: 72, sho: 53, pas: 70, dri: 70, def: 88, phy: 76 } },
      { id: 'couto', name: 'Julien Duranville', pos: 'RW', ovr: 76, stats: { pac: 85, sho: 73, pas: 67, dri: 88, def: 41, phy: 67 } },
      { id: 'ozcan', name: 'Salih Özcan', pos: 'CDM', ovr: 77, stats: { pac: 69, sho: 68, pas: 77, dri: 70, def: 80, phy: 75 } },
      { id: 'malen2', name: 'Donyell Malen Jr', pos: 'LW', ovr: 78, stats: { pac: 92, sho: 82, pas: 71, dri: 78, def: 43, phy: 66 } }
    ]
  },
  {
    id: 'rb_leipzig',
    name: 'RB Leipzig',
    logo: '🔴⚪',
    squad: [
      { id: 'gulacsi', name: 'Péter Gulácsi', pos: 'GK', ovr: 80, stats: { div: 85, han: 83, kic: 75, ref: 77, spd: 42, pos: 82 } },
      { id: 'henrichs', name: 'Benjamin Henrichs', pos: 'RB', ovr: 78, stats: { pac: 82, sho: 60, pas: 69, dri: 72, def: 79, phy: 77 } },
      { id: 'lukeba', name: 'Castello Lukeba', pos: 'CB', ovr: 82, stats: { pac: 76, sho: 50, pas: 75, dri: 71, def: 81, phy: 82 } },
      { id: 'orban', name: 'Willi Orban', pos: 'CB', ovr: 79, stats: { pac: 68, sho: 44, pas: 71, dri: 61, def: 80, phy: 77 } },
      { id: 'raum', name: 'David Raum', pos: 'LB', ovr: 80, stats: { pac: 84, sho: 50, pas: 79, dri: 74, def: 72, phy: 79 } },
      { id: 'haidara', name: 'Amadou Haidara', pos: 'CDM', ovr: 78, stats: { pac: 65, sho: 69, pas: 80, dri: 77, def: 78, phy: 79 } },
      { id: 'schlager', name: 'Xaver Schlager', pos: 'CM', ovr: 78, stats: { pac: 67, sho: 75, pas: 86, dri: 80, def: 69, phy: 74 } },
      { id: 'baumgartner', name: 'Christoph Baumgartner', pos: 'CAM', ovr: 81, stats: { pac: 81, sho: 79, pas: 89, dri: 83, def: 54, phy: 68 } },
      { id: 'nusa', name: 'Antonio Nusa', pos: 'RW', ovr: 80, stats: { pac: 91, sho: 79, pas: 72, dri: 90, def: 45, phy: 69 } },
      { id: 'simakan', name: 'Assan Ouedraogo', pos: 'CM', ovr: 76, stats: { pac: 66, sho: 65, pas: 84, dri: 74, def: 64, phy: 74 } },
      { id: 'sesko_b', name: 'Yan Diomande Jr', pos: 'ST', ovr: 78, stats: { pac: 79, sho: 89, pas: 65, dri: 86, def: 43, phy: 79 } },
      { id: 'poulsen', name: 'Lois Openda', pos: 'ST', ovr: 82, stats: { pac: 87, sho: 85, pas: 74, dri: 81, def: 49, phy: 74 } },
      { id: 'vandevoordt', name: 'Maarten Vandevoordt', pos: 'GK', ovr: 78, stats: { div: 78, han: 82, kic: 75, ref: 84, spd: 31, pos: 76 } },
      { id: 'klostermann', name: 'Lutsharel Geertruida', pos: 'RB', ovr: 78, stats: { pac: 85, sho: 49, pas: 77, dri: 74, def: 82, phy: 66 } },
      { id: 'nedeljkovic', name: 'David Nedeljković', pos: 'CB', ovr: 74, stats: { pac: 70, sho: 42, pas: 62, dri: 54, def: 82, phy: 76 } },
      { id: 'romulo', name: 'Xavi Simons Jr', pos: 'CAM', ovr: 78, stats: { pac: 70, sho: 75, pas: 89, dri: 81, def: 55, phy: 66 } }
    ]
  },
  {
    id: 'leverkusen',
    name: 'Bayer Leverkusen',
    logo: '⚫🔴',
    squad: [
      { id: 'hradecky', name: 'Mark Flekken', pos: 'GK', ovr: 81, stats: { div: 79, han: 83, kic: 75, ref: 80, spd: 30, pos: 77 } },
      { id: 'tapsoba_j', name: 'Jeanuël Belocian', pos: 'CB', ovr: 78, stats: { pac: 71, sho: 48, pas: 67, dri: 60, def: 83, phy: 82 } },
      { id: 'tah_j', name: 'Odilon Kossounou', pos: 'CB', ovr: 79, stats: { pac: 75, sho: 50, pas: 67, dri: 60, def: 86, phy: 80 } },
      { id: 'grimaldo', name: 'Alejandro Grimaldo', pos: 'LB', ovr: 84, stats: { pac: 89, sho: 55, pas: 84, dri: 80, def: 86, phy: 82 } },
      { id: 'tella', name: 'Nathan Tella', pos: 'RB', ovr: 77, stats: { pac: 79, sho: 47, pas: 78, dri: 75, def: 79, phy: 68 } },
      { id: 'xhaka_r', name: 'Robert Andrich', pos: 'CDM', ovr: 79, stats: { pac: 65, sho: 69, pas: 75, dri: 69, def: 81, phy: 82 } },
      { id: 'garcia', name: 'Aleix García', pos: 'CM', ovr: 82, stats: { pac: 70, sho: 74, pas: 85, dri: 82, def: 69, phy: 83 } },
      { id: 'wirtz_h', name: 'Ibrahim Maza', pos: 'CAM', ovr: 78, stats: { pac: 78, sho: 80, pas: 82, dri: 87, def: 53, phy: 73 } },
      { id: 'poku', name: 'Ernest Poku', pos: 'RW', ovr: 76, stats: { pac: 79, sho: 78, pas: 77, dri: 82, def: 44, phy: 66 } },
      { id: 'schick', name: 'Patrik Schick', pos: 'ST', ovr: 83, stats: { pac: 86, sho: 83, pas: 81, dri: 82, def: 49, phy: 74 } },
      { id: 'boniface', name: 'Victor Boniface', pos: 'ST', ovr: 81, stats: { pac: 81, sho: 91, pas: 67, dri: 78, def: 53, phy: 73 } },
      { id: 'grimaldo2', name: 'Amine Adli', pos: 'LW', ovr: 78, stats: { pac: 80, sho: 77, pas: 75, dri: 84, def: 48, phy: 63 } },
      { id: 'hradecky2', name: 'Lukáš Hrádecký', pos: 'GK', ovr: 77, stats: { div: 82, han: 78, kic: 64, ref: 75, spd: 37, pos: 77 } },
      { id: 'hincapie', name: 'Piero Hincapié', pos: 'CB', ovr: 80, stats: { pac: 69, sho: 45, pas: 71, dri: 62, def: 85, phy: 86 } },
      { id: 'hofmann_j', name: 'Jonas Hofmann', pos: 'CAM', ovr: 78, stats: { pac: 70, sho: 77, pas: 87, dri: 80, def: 58, phy: 75 } },
      { id: 'terrier', name: 'Martin Terrier', pos: 'LW', ovr: 79, stats: { pac: 86, sho: 76, pas: 79, dri: 85, def: 46, phy: 74 } }
    ]
  },
  {
    id: 'eintracht_frankfurt',
    name: 'Eintracht Frankfurt',
    logo: '⚫🔴',
    squad: [
      { id: 'grashuis', name: 'Kaua Santos', pos: 'GK', ovr: 77, stats: { div: 81, han: 74, kic: 66, ref: 77, spd: 36, pos: 82 } },
      { id: 'koch', name: 'Robin Koch', pos: 'CB', ovr: 79, stats: { pac: 75, sho: 54, pas: 75, dri: 69, def: 78, phy: 81 } },
      { id: 'theate', name: 'Arthur Theate', pos: 'CB', ovr: 77, stats: { pac: 74, sho: 52, pas: 66, dri: 62, def: 83, phy: 77 } },
      { id: 'kristensen', name: 'Rasmus Kristensen', pos: 'RB', ovr: 77, stats: { pac: 79, sho: 48, pas: 72, dri: 75, def: 69, phy: 67 } },
      { id: 'bruck', name: 'Nathaniel Brown', pos: 'LB', ovr: 76, stats: { pac: 84, sho: 55, pas: 77, dri: 76, def: 78, phy: 75 } },
      { id: 'larsson', name: 'Sebastian Larsson II', pos: 'CDM', ovr: 77, stats: { pac: 72, sho: 57, pas: 77, dri: 68, def: 83, phy: 76 } },
      { id: 'skhiri', name: 'Ellyes Skhiri', pos: 'CM', ovr: 79, stats: { pac: 74, sho: 76, pas: 84, dri: 76, def: 71, phy: 76 } },
      { id: 'doan', name: 'Ritsu Dōan', pos: 'RW', ovr: 80, stats: { pac: 93, sho: 75, pas: 74, dri: 88, def: 43, phy: 71 } },
      { id: 'knauff', name: 'Ansgar Knauff', pos: 'LW', ovr: 77, stats: { pac: 90, sho: 75, pas: 70, dri: 83, def: 45, phy: 63 } },
      { id: 'burkardt', name: 'Jonathan Burkardt', pos: 'ST', ovr: 79, stats: { pac: 77, sho: 81, pas: 69, dri: 80, def: 46, phy: 72 } },
      { id: 'goetze', name: 'Can Uzun', pos: 'CAM', ovr: 78, stats: { pac: 69, sho: 77, pas: 88, dri: 85, def: 55, phy: 72 } },
      { id: 'chaibi', name: 'Nkunku Chaibi', pos: 'ST', ovr: 75, stats: { pac: 74, sho: 84, pas: 67, dri: 78, def: 46, phy: 71 } },
      { id: 'trapp', name: 'Kevin Trapp', pos: 'GK', ovr: 80, stats: { div: 79, han: 76, kic: 69, ref: 82, spd: 35, pos: 81 } },
      { id: 'uzun', name: 'Hugo Ekitike Jr', pos: 'ST', ovr: 78, stats: { pac: 75, sho: 82, pas: 74, dri: 77, def: 49, phy: 74 } },
      { id: 'chandler', name: 'Timothy Chandler II', pos: 'RB', ovr: 73, stats: { pac: 72, sho: 55, pas: 67, dri: 74, def: 67, phy: 62 } },
      { id: 'gotze', name: 'Mario Götze', pos: 'CAM', ovr: 78, stats: { pac: 78, sho: 75, pas: 79, dri: 83, def: 53, phy: 73 } }
    ]
  },
  {
    id: 'stuttgart',
    name: 'VfB Stuttgart',
    logo: '⚪🔴',
    squad: [
      { id: 'nubel', name: 'Alexander Nübel', pos: 'GK', ovr: 80, stats: { div: 77, han: 76, kic: 77, ref: 84, spd: 31, pos: 78 } },
      { id: 'stenzel', name: 'Jacob Bruun Larsen', pos: 'RW', ovr: 77, stats: { pac: 83, sho: 77, pas: 74, dri: 87, def: 49, phy: 67 } },
      { id: 'anton_j', name: 'Jeff Chabot', pos: 'CB', ovr: 78, stats: { pac: 73, sho: 51, pas: 73, dri: 64, def: 85, phy: 83 } },
      { id: 'rouault', name: 'Dan-Axel Zagadou', pos: 'CB', ovr: 78, stats: { pac: 75, sho: 44, pas: 74, dri: 58, def: 85, phy: 81 } },
      { id: 'mittelstadt', name: 'Maximilian Mittelstädt', pos: 'LB', ovr: 79, stats: { pac: 81, sho: 61, pas: 76, dri: 76, def: 80, phy: 77 } },
      { id: 'stiller', name: 'Angelo Stiller', pos: 'CDM', ovr: 81, stats: { pac: 72, sho: 66, pas: 78, dri: 74, def: 88, phy: 81 } },
      { id: 'karazor', name: 'Atakan Karazor', pos: 'CM', ovr: 78, stats: { pac: 71, sho: 71, pas: 81, dri: 76, def: 73, phy: 80 } },
      { id: 'undav', name: 'Deniz Undav', pos: 'ST', ovr: 82, stats: { pac: 85, sho: 87, pas: 70, dri: 82, def: 48, phy: 79 } },
      { id: 'leweling', name: 'Nick Woltemade Jr', pos: 'ST', ovr: 78, stats: { pac: 82, sho: 79, pas: 75, dri: 78, def: 52, phy: 78 } },
      { id: 'fuhrich', name: 'Chris Führich', pos: 'RW', ovr: 79, stats: { pac: 93, sho: 73, pas: 74, dri: 90, def: 41, phy: 64 } },
      { id: 'el_khannouss', name: 'Ismail Jakobs', pos: 'LB', ovr: 76, stats: { pac: 79, sho: 52, pas: 77, dri: 77, def: 74, phy: 76 } },
      { id: 'vagnoman', name: 'Josha Vagnoman', pos: 'RB', ovr: 76, stats: { pac: 78, sho: 52, pas: 74, dri: 73, def: 72, phy: 71 } },
      { id: 'bredlow', name: 'Fabian Bredlow', pos: 'GK', ovr: 73, stats: { div: 73, han: 76, kic: 67, ref: 75, spd: 31, pos: 72 } },
      { id: 'rieder', name: 'Jamie Leweling', pos: 'LW', ovr: 78, stats: { pac: 85, sho: 77, pas: 75, dri: 89, def: 52, phy: 68 } },
      { id: 'demirovic', name: 'Ermedin Demirović', pos: 'ST', ovr: 78, stats: { pac: 80, sho: 85, pas: 76, dri: 78, def: 48, phy: 78 } }
    ]
  },
  {
    id: 'gladbach',
    name: 'Borussia Mönchengladbach',
    logo: '⚫🟢',
    squad: [
      { id: 'nicolas', name: 'Moritz Nicolas', pos: 'GK', ovr: 76, stats: { div: 74, han: 73, kic: 73, ref: 81, spd: 37, pos: 72 } },
      { id: 'scally', name: 'Joe Scally', pos: 'RB', ovr: 76, stats: { pac: 83, sho: 54, pas: 76, dri: 80, def: 79, phy: 69 } },
      { id: 'elvedi', name: 'Nico Elvedi', pos: 'CB', ovr: 78, stats: { pac: 66, sho: 45, pas: 70, dri: 64, def: 78, phy: 76 } },
      { id: 'friedrich_m', name: 'Marco Friedrich', pos: 'CB', ovr: 76, stats: { pac: 70, sho: 47, pas: 66, dri: 68, def: 82, phy: 73 } },
      { id: 'honorat', name: 'Nathan Ngoumou', pos: 'LW', ovr: 76, stats: { pac: 83, sho: 77, pas: 70, dri: 84, def: 38, phy: 64 } },
      { id: 'sander_r', name: 'Rocco Reitz', pos: 'CM', ovr: 79, stats: { pac: 77, sho: 72, pas: 85, dri: 75, def: 71, phy: 78 } },
      { id: 'weigl', name: 'Julian Weigl', pos: 'CDM', ovr: 77, stats: { pac: 64, sho: 65, pas: 75, dri: 77, def: 82, phy: 78 } },
      { id: 'kleindienst', name: 'Tim Kleindienst', pos: 'ST', ovr: 79, stats: { pac: 77, sho: 81, pas: 74, dri: 76, def: 44, phy: 71 } },
      { id: 'reitz', name: 'Franck Honorat', pos: 'LW', ovr: 77, stats: { pac: 85, sho: 79, pas: 74, dri: 87, def: 40, phy: 61 } },
      { id: 'plea', name: 'Alassane Pléa', pos: 'CAM', ovr: 77, stats: { pac: 76, sho: 73, pas: 86, dri: 81, def: 49, phy: 66 } },
      { id: 'itakura', name: 'Kō Itakura', pos: 'CB', ovr: 77, stats: { pac: 64, sho: 52, pas: 70, dri: 61, def: 80, phy: 78 } },
      { id: 'netz', name: 'Fabio Netz', pos: 'LB', ovr: 74, stats: { pac: 71, sho: 55, pas: 71, dri: 78, def: 71, phy: 69 } },
      { id: 'omlin', name: 'Jonas Omlin', pos: 'GK', ovr: 78, stats: { div: 76, han: 72, kic: 74, ref: 84, spd: 34, pos: 82 } },
      { id: 'nathan_ngoumou', name: 'Grant-Leon Ranos', pos: 'ST', ovr: 74, stats: { pac: 81, sho: 78, pas: 67, dri: 82, def: 44, phy: 75 } },
      { id: 'sander2', name: 'Christoph Kramer', pos: 'CDM', ovr: 74, stats: { pac: 61, sho: 59, pas: 75, dri: 65, def: 76, phy: 81 } }
    ]
  },
  {
    id: 'freiburg',
    name: 'SC Freiburg',
    logo: '🔴⚫',
    squad: [
      { id: 'atubolu', name: 'Noah Atubolu', pos: 'GK', ovr: 78, stats: { div: 79, han: 80, kic: 67, ref: 77, spd: 35, pos: 75 } },
      { id: 'gunter', name: 'Christian Günter', pos: 'LB', ovr: 77, stats: { pac: 85, sho: 50, pas: 74, dri: 70, def: 75, phy: 70 } },
      { id: 'ginter', name: 'Matthias Ginter', pos: 'CB', ovr: 79, stats: { pac: 70, sho: 44, pas: 66, dri: 69, def: 81, phy: 78 } },
      { id: 'lienhart', name: 'Philipp Lienhart', pos: 'CB', ovr: 77, stats: { pac: 65, sho: 44, pas: 66, dri: 57, def: 83, phy: 77 } },
      { id: 'kubler', name: 'Kimberly Ezekwem', pos: 'RB', ovr: 74, stats: { pac: 72, sho: 52, pas: 65, dri: 69, def: 76, phy: 64 } },
      { id: 'eggestein', name: 'Maximilian Eggestein', pos: 'CDM', ovr: 77, stats: { pac: 66, sho: 67, pas: 79, dri: 67, def: 79, phy: 82 } },
      { id: 'osterhage', name: 'Merlin Röhl', pos: 'CM', ovr: 76, stats: { pac: 69, sho: 74, pas: 76, dri: 81, def: 68, phy: 71 } },
      { id: 'grifo', name: 'Vincenzo Grifo', pos: 'CAM', ovr: 80, stats: { pac: 75, sho: 74, pas: 88, dri: 83, def: 61, phy: 73 } },
      { id: 'adamu', name: 'Junior Adamu', pos: 'ST', ovr: 77, stats: { pac: 78, sho: 80, pas: 70, dri: 76, def: 51, phy: 68 } },
      { id: 'doan_r', name: 'Ritsu Dōan Jr', pos: 'RW', ovr: 74, stats: { pac: 82, sho: 73, pas: 67, dri: 83, def: 41, phy: 66 } },
      { id: 'holer', name: 'Michael Gregoritsch', pos: 'ST', ovr: 78, stats: { pac: 82, sho: 82, pas: 69, dri: 75, def: 44, phy: 78 } },
      { id: 'sildillia', name: 'Kiliann Sildillia', pos: 'RB', ovr: 75, stats: { pac: 75, sho: 53, pas: 66, dri: 74, def: 71, phy: 69 } },
      { id: 'muller_f', name: 'Florian Müller', pos: 'GK', ovr: 76, stats: { div: 75, han: 71, kic: 66, ref: 75, spd: 31, pos: 78 } },
      { id: 'rohl', name: 'Yannik Keitel', pos: 'CM', ovr: 75, stats: { pac: 66, sho: 66, pas: 84, dri: 78, def: 72, phy: 77 } },
      { id: 'gregoritsch', name: 'Igor Matanović', pos: 'ST', ovr: 74, stats: { pac: 73, sho: 77, pas: 60, dri: 78, def: 46, phy: 68 } }
    ]
  },
  {
    id: 'werder_bremen',
    name: 'Werder Bremen',
    logo: '🟢⚪',
    squad: [
      { id: 'zetterer', name: 'Michael Zetterer', pos: 'GK', ovr: 78, stats: { div: 78, han: 79, kic: 72, ref: 77, spd: 43, pos: 77 } },
      { id: 'friedl', name: 'Marco Friedl Bremen', pos: 'CB', ovr: 77, stats: { pac: 71, sho: 43, pas: 64, dri: 68, def: 84, phy: 82 } },
      { id: 'stark_n', name: 'Niklas Stark', pos: 'CB', ovr: 76, stats: { pac: 62, sho: 40, pas: 64, dri: 58, def: 78, phy: 77 } },
      { id: 'bittencourt', name: 'Leonardo Bittencourt', pos: 'CAM', ovr: 78, stats: { pac: 68, sho: 74, pas: 86, dri: 80, def: 58, phy: 71 } },
      { id: 'coulibaly', name: 'Amos Pieper', pos: 'CB', ovr: 76, stats: { pac: 71, sho: 43, pas: 67, dri: 64, def: 78, phy: 72 } },
      { id: 'agu', name: 'Anthony Jung', pos: 'LB', ovr: 75, stats: { pac: 81, sho: 54, pas: 68, dri: 68, def: 77, phy: 70 } },
      { id: 'stage', name: 'Jens Stage', pos: 'CM', ovr: 76, stats: { pac: 65, sho: 65, pas: 75, dri: 79, def: 65, phy: 79 } },
      { id: 'weiser', name: 'Mitchell Weiser', pos: 'RB', ovr: 77, stats: { pac: 82, sho: 48, pas: 75, dri: 74, def: 78, phy: 75 } },
      { id: 'njinmah', name: 'Justin Njinmah', pos: 'RW', ovr: 77, stats: { pac: 82, sho: 70, pas: 78, dri: 82, def: 50, phy: 69 } },
      { id: 'burke', name: 'Oliver Burke', pos: 'ST', ovr: 74, stats: { pac: 80, sho: 84, pas: 68, dri: 75, def: 39, phy: 72 } },
      { id: 'schmid_m', name: 'Marvin Ducksch', pos: 'ST', ovr: 79, stats: { pac: 81, sho: 85, pas: 76, dri: 77, def: 52, phy: 70 } },
      { id: 'grull', name: 'Romano Schmid', pos: 'CAM', ovr: 77, stats: { pac: 75, sho: 79, pas: 80, dri: 84, def: 59, phy: 71 } },
      { id: 'pantovic', name: 'Michael Kraft', pos: 'GK', ovr: 71, stats: { div: 72, han: 67, kic: 59, ref: 72, spd: 36, pos: 68 } },
      { id: 'ducksch', name: 'Rafael Borré', pos: 'ST', ovr: 78, stats: { pac: 79, sho: 80, pas: 72, dri: 82, def: 45, phy: 71 } },
      { id: 'njinmah2', name: 'Derrick Köhn', pos: 'LB', ovr: 74, stats: { pac: 76, sho: 49, pas: 75, dri: 70, def: 70, phy: 73 } }
    ]
  },
  {
    id: 'mainz',
    name: 'Mainz 05',
    logo: '🔴⚪',
    squad: [
      { id: 'zentner', name: 'Robin Zentner', pos: 'GK', ovr: 77, stats: { div: 74, han: 77, kic: 67, ref: 82, spd: 38, pos: 80 } },
      { id: 'bell', name: 'Silas Katompa Mvumpa', pos: 'RW', ovr: 78, stats: { pac: 82, sho: 78, pas: 75, dri: 84, def: 49, phy: 72 } },
      { id: 'caci', name: 'Anthony Caci', pos: 'RB', ovr: 75, stats: { pac: 72, sho: 48, pas: 69, dri: 69, def: 68, phy: 66 } },
      { id: 'hanche_olsen', name: 'Stefan Bell', pos: 'CB', ovr: 76, stats: { pac: 64, sho: 48, pas: 67, dri: 57, def: 78, phy: 78 } },
      { id: 'sano', name: 'Andreas Hanche-Olsen', pos: 'CB', ovr: 76, stats: { pac: 66, sho: 42, pas: 63, dri: 56, def: 86, phy: 81 } },
      { id: 'barreiro', name: 'Nadiem Amiri', pos: 'CAM', ovr: 78, stats: { pac: 69, sho: 79, pas: 90, dri: 85, def: 49, phy: 70 } },
      { id: 'lee_j', name: 'Jae-sung Lee', pos: 'CM', ovr: 77, stats: { pac: 70, sho: 65, pas: 82, dri: 71, def: 74, phy: 77 } },
      { id: 'nebel', name: 'Nelson Weiper', pos: 'ST', ovr: 76, stats: { pac: 81, sho: 87, pas: 70, dri: 75, def: 43, phy: 68 } },
      { id: 'amiri', name: 'Kaishu Sano', pos: 'CDM', ovr: 75, stats: { pac: 59, sho: 64, pas: 77, dri: 67, def: 75, phy: 79 } },
      { id: 'burkardt_j', name: 'Jonathan Burkardt Jr', pos: 'ST', ovr: 77, stats: { pac: 84, sho: 88, pas: 65, dri: 82, def: 51, phy: 76 } },
      { id: 'widmer', name: 'Silvan Widmer', pos: 'RB', ovr: 75, stats: { pac: 75, sho: 47, pas: 75, dri: 71, def: 71, phy: 70 } },
      { id: 'weiper', name: 'Phillipp Mwene', pos: 'LB', ovr: 74, stats: { pac: 74, sho: 54, pas: 67, dri: 66, def: 73, phy: 70 } },
      { id: 'lindner', name: 'Finn Dahmen', pos: 'GK', ovr: 73, stats: { div: 77, han: 74, kic: 69, ref: 79, spd: 37, pos: 73 } },
      { id: 'sanoo', name: 'Dominik Kohr', pos: 'CDM', ovr: 75, stats: { pac: 61, sho: 59, pas: 74, dri: 64, def: 81, phy: 73 } },
      { id: 'barkok', name: 'Danny da Costa', pos: 'RB', ovr: 74, stats: { pac: 75, sho: 56, pas: 65, dri: 66, def: 71, phy: 64 } }
    ]
  },
  {
    id: 'union_berlin',
    name: 'Union Berlin',
    logo: '🔴⚪',
    squad: [
      { id: 'rönnow', name: 'Frederik Rönnow', pos: 'GK', ovr: 78, stats: { div: 81, han: 72, kic: 73, ref: 84, spd: 42, pos: 77 } },
      { id: 'leite', name: 'Diogo Leite', pos: 'CB', ovr: 78, stats: { pac: 67, sho: 50, pas: 70, dri: 63, def: 80, phy: 79 } },
      { id: 'doekhi', name: 'Danilho Doekhi', pos: 'CB', ovr: 78, stats: { pac: 72, sho: 52, pas: 75, dri: 60, def: 80, phy: 79 } },
      { id: 'trimmel', name: 'Christopher Trimmel', pos: 'RB', ovr: 75, stats: { pac: 78, sho: 49, pas: 67, dri: 68, def: 71, phy: 69 } },
      { id: 'gosens', name: 'Robin Gosens', pos: 'LB', ovr: 79, stats: { pac: 87, sho: 60, pas: 79, dri: 83, def: 83, phy: 74 } },
      { id: 'haberer', name: 'Rani Khedira', pos: 'CDM', ovr: 76, stats: { pac: 70, sho: 57, pas: 76, dri: 71, def: 78, phy: 79 } },
      { id: 'khedira', name: 'Janik Haberer', pos: 'CM', ovr: 76, stats: { pac: 75, sho: 68, pas: 82, dri: 74, def: 66, phy: 79 } },
      { id: 'bulter', name: 'Yorbe Vertessen', pos: 'RW', ovr: 76, stats: { pac: 78, sho: 70, pas: 74, dri: 81, def: 39, phy: 68 } },
      { id: 'hollerbach', name: 'Benedict Hollerbach', pos: 'LW', ovr: 76, stats: { pac: 82, sho: 75, pas: 71, dri: 82, def: 45, phy: 65 } },
      { id: 'ilic', name: 'Ivan Ilić', pos: 'CM', ovr: 77, stats: { pac: 66, sho: 65, pas: 86, dri: 78, def: 64, phy: 79 } },
      { id: 'michel_j', name: 'Jordan', pos: 'ST', ovr: 76, stats: { pac: 76, sho: 77, pas: 68, dri: 75, def: 46, phy: 73 } },
      { id: 'skarke', name: 'Andrej Ilić', pos: 'ST', ovr: 74, stats: { pac: 74, sho: 81, pas: 61, dri: 76, def: 45, phy: 65 } },
      { id: 'luthe', name: 'Michael Luthe', pos: 'GK', ovr: 71, stats: { div: 71, han: 66, kic: 62, ref: 77, spd: 38, pos: 73 } },
      { id: 'juranovic', name: 'Josip Juranović', pos: 'RB', ovr: 76, stats: { pac: 81, sho: 47, pas: 78, dri: 77, def: 69, phy: 74 } },
      { id: 'gosens2', name: 'Kevin Vogt', pos: 'CB', ovr: 75, stats: { pac: 66, sho: 41, pas: 73, dri: 62, def: 82, phy: 73 } }
    ]
  },
  {
    id: 'hoffenheim',
    name: 'TSG Hoffenheim',
    logo: '🔵⚪',
    squad: [
      { id: 'baumann', name: 'Oliver Baumann', pos: 'GK', ovr: 79, stats: { div: 83, han: 74, kic: 68, ref: 80, spd: 30, pos: 80 } },
      { id: 'vogt', name: 'Kevin Akpoguma', pos: 'CB', ovr: 76, stats: { pac: 65, sho: 44, pas: 70, dri: 61, def: 85, phy: 79 } },
      { id: 'beier_finn', name: 'Stanley Nsoki', pos: 'CB', ovr: 76, stats: { pac: 72, sho: 47, pas: 73, dri: 66, def: 76, phy: 81 } },
      { id: 'kaderabek', name: 'Pavel Kadeřábek', pos: 'RB', ovr: 76, stats: { pac: 76, sho: 55, pas: 74, dri: 78, def: 69, phy: 68 } },
      { id: 'john_a', name: 'Anton Stach', pos: 'CDM', ovr: 79, stats: { pac: 72, sho: 70, pas: 80, dri: 68, def: 84, phy: 76 } },
      { id: 'bischof', name: 'Tom Bischof II', pos: 'CM', ovr: 76, stats: { pac: 71, sho: 72, pas: 75, dri: 81, def: 70, phy: 71 } },
      { id: 'asllani', name: 'Marius Bülter', pos: 'RW', ovr: 76, stats: { pac: 80, sho: 73, pas: 76, dri: 83, def: 39, phy: 60 } },
      { id: 'kramaric', name: 'Andrej Kramarić', pos: 'ST', ovr: 80, stats: { pac: 78, sho: 90, pas: 68, dri: 83, def: 47, phy: 78 } },
      { id: 'bebou', name: 'Ihlas Bebou', pos: 'ST', ovr: 76, stats: { pac: 78, sho: 78, pas: 73, dri: 78, def: 48, phy: 76 } },
      { id: 'angelo', name: 'Fisnik Asllani', pos: 'CAM', ovr: 75, stats: { pac: 76, sho: 67, pas: 79, dri: 77, def: 51, phy: 71 } },
      { id: 'prass', name: 'Wout Weghorst', pos: 'ST', ovr: 77, stats: { pac: 84, sho: 77, pas: 65, dri: 83, def: 49, phy: 72 } },
      { id: 'akpoguma', name: 'Christoph Baumgartner Jr', pos: 'CAM', ovr: 74, stats: { pac: 70, sho: 68, pas: 84, dri: 79, def: 54, phy: 67 } },
      { id: 'drewes', name: 'Luca Philipp', pos: 'GK', ovr: 68, stats: { div: 65, han: 65, kic: 57, ref: 74, spd: 38, pos: 63 } },
      { id: 'nsoki', name: 'Justin Che', pos: 'RB', ovr: 73, stats: { pac: 71, sho: 47, pas: 69, dri: 72, def: 70, phy: 65 } },
      { id: 'stach2', name: 'Umut Tohumcu', pos: 'CM', ovr: 73, stats: { pac: 61, sho: 66, pas: 75, dri: 67, def: 65, phy: 77 } }
    ]
  },
  {
    id: 'augsburg',
    name: 'FC Augsburg',
    logo: '🔴🟢',
    squad: [
      { id: 'dahmen', name: 'Nediljko Labrović', pos: 'GK', ovr: 74, stats: { div: 70, han: 69, kic: 68, ref: 74, spd: 33, pos: 74 } },
      { id: 'gouweleeuw', name: 'Jeffrey Gouweleeuw', pos: 'CB', ovr: 77, stats: { pac: 66, sho: 48, pas: 69, dri: 68, def: 87, phy: 73 } },
      { id: 'giannoulis', name: 'Robert Gumny', pos: 'RB', ovr: 76, stats: { pac: 79, sho: 55, pas: 76, dri: 77, def: 76, phy: 72 } },
      { id: 'framberger', name: 'Patric Pfeiffer', pos: 'CB', ovr: 75, stats: { pac: 65, sho: 42, pas: 71, dri: 65, def: 84, phy: 79 } },
      { id: 'pfeiffer', name: 'Fredrik Jensen', pos: 'LM', ovr: 75, stats: { pac: 67, sho: 70, pas: 82, dri: 75, def: 69, phy: 71 } },
      { id: 'rieder_e', name: 'Elvis Rexhbeçaj', pos: 'CM', ovr: 75, stats: { pac: 70, sho: 66, pas: 74, dri: 73, def: 65, phy: 79 } },
      { id: 'maier_a', name: 'Arne Maier', pos: 'CDM', ovr: 76, stats: { pac: 66, sho: 60, pas: 71, dri: 67, def: 78, phy: 74 } },
      { id: 'vargas_r', name: 'Ruben Vargas', pos: 'LW', ovr: 77, stats: { pac: 79, sho: 79, pas: 72, dri: 82, def: 46, phy: 65 } },
      { id: 'demirovic_e', name: 'Alexis Claude-Maurice', pos: 'RW', ovr: 76, stats: { pac: 80, sho: 69, pas: 70, dri: 80, def: 47, phy: 67 } },
      { id: 'breithaupt', name: 'Phillip Tietz', pos: 'ST', ovr: 76, stats: { pac: 84, sho: 80, pas: 73, dri: 79, def: 41, phy: 68 } },
      { id: 'tietz', name: 'Sirlord Conteh', pos: 'ST', ovr: 74, stats: { pac: 78, sho: 86, pas: 64, dri: 79, def: 43, phy: 74 } },
      { id: 'gumny', name: 'Keven Schlotterbeck', pos: 'CB', ovr: 75, stats: { pac: 62, sho: 45, pas: 72, dri: 58, def: 76, phy: 71 } },
      { id: 'koubek', name: 'Tomáš Koubek', pos: 'GK', ovr: 71, stats: { div: 69, han: 68, kic: 65, ref: 70, spd: 35, pos: 68 } },
      { id: 'rexhbecaj', name: 'Kristijan Jakić', pos: 'CDM', ovr: 74, stats: { pac: 65, sho: 64, pas: 74, dri: 64, def: 81, phy: 82 } },
      { id: 'maier2', name: 'Mert Kömür', pos: 'RB', ovr: 71, stats: { pac: 74, sho: 42, pas: 71, dri: 74, def: 67, phy: 61 } }
    ]
  },
  {
    id: 'holstein_kiel',
    name: 'Holstein Kiel',
    logo: '🔵⚪',
    squad: [
      { id: 'weiner', name: 'Timon Weiner', pos: 'GK', ovr: 73, stats: { div: 71, han: 72, kic: 69, ref: 76, spd: 44, pos: 70 } },
      { id: 'erras', name: 'Fiete Arp', pos: 'ST', ovr: 74, stats: { pac: 75, sho: 83, pas: 68, dri: 75, def: 46, phy: 68 } },
      { id: 'multhaup_lewis', name: 'Lewis Holtby', pos: 'CM', ovr: 74, stats: { pac: 63, sho: 65, pas: 73, dri: 76, def: 64, phy: 72 } },
      { id: 'bernhardsson', name: 'Marko Ivezić', pos: 'CB', ovr: 73, stats: { pac: 66, sho: 40, pas: 65, dri: 53, def: 82, phy: 76 } },
      { id: 'sterner', name: 'Hauke Wahl', pos: 'CB', ovr: 74, stats: { pac: 72, sho: 39, pas: 67, dri: 63, def: 76, phy: 71 } },
      { id: 'porath', name: 'Alexander Bernhardsson', pos: 'RW', ovr: 74, stats: { pac: 78, sho: 68, pas: 73, dri: 75, def: 46, phy: 63 } },
      { id: 'rosenboom', name: 'Timo Becker', pos: 'RB', ovr: 72, stats: { pac: 74, sho: 49, pas: 69, dri: 72, def: 71, phy: 64 } },
      { id: 'ivezic', name: 'Phil Harres', pos: 'ST', ovr: 73, stats: { pac: 79, sho: 76, pas: 68, dri: 78, def: 46, phy: 67 } },
      { id: 'harres', name: 'Fabian Reese', pos: 'LW', ovr: 76, stats: { pac: 87, sho: 80, pas: 71, dri: 79, def: 44, phy: 71 } },
      { id: 'reese', name: 'Shuto Machino', pos: 'ST', ovr: 75, stats: { pac: 74, sho: 75, pas: 67, dri: 79, def: 48, phy: 69 } },
      { id: 'holtby', name: 'Benedikt Pichler', pos: 'ST', ovr: 73, stats: { pac: 82, sho: 76, pas: 68, dri: 70, def: 37, phy: 65 } },
      { id: 'wahl', name: 'Nino Kajtaz', pos: 'CB', ovr: 72, stats: { pac: 59, sho: 42, pas: 65, dri: 54, def: 81, phy: 72 } },
      { id: 'weiner2', name: 'Jonas Meyer', pos: 'GK', ovr: 65, stats: { div: 62, han: 61, kic: 59, ref: 71, spd: 32, pos: 60 } },
      { id: 'becker_t', name: 'Marcel Beifus', pos: 'CDM', ovr: 71, stats: { pac: 64, sho: 54, pas: 75, dri: 65, def: 77, phy: 71 } }
    ]
  },
  {
    id: 'fc_koln',
    name: '1. FC Köln',
    logo: '🔴⚪',
    squad: [
      { id: 'schwabe', name: 'Marvin Schwäbe', pos: 'GK', ovr: 77, stats: { div: 81, han: 76, kic: 67, ref: 83, spd: 31, pos: 79 } },
      { id: 'huseinbasic', name: 'Timo Hübers', pos: 'CB', ovr: 76, stats: { pac: 63, sho: 48, pas: 67, dri: 66, def: 75, phy: 79 } },
      { id: 'sava', name: 'Justin Diehl', pos: 'CB', ovr: 75, stats: { pac: 66, sho: 50, pas: 72, dri: 63, def: 76, phy: 74 } },
      { id: 'meissner', name: 'Jeff Chabot Jr', pos: 'RB', ovr: 74, stats: { pac: 73, sho: 49, pas: 67, dri: 68, def: 75, phy: 70 } },
      { id: 'kilian', name: 'Joel Wollscheid', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 50, pas: 63, dri: 61, def: 74, phy: 80 } },
      { id: 'kainz', name: 'Florian Kainz', pos: 'CAM', ovr: 78, stats: { pac: 78, sho: 73, pas: 87, dri: 88, def: 51, phy: 68 } },
      { id: 'ljubicic', name: 'Denis Huseinbašić', pos: 'CDM', ovr: 75, stats: { pac: 65, sho: 66, pas: 69, dri: 71, def: 80, phy: 76 } },
      { id: 'thielmann', name: 'Linton Maina', pos: 'RW', ovr: 76, stats: { pac: 85, sho: 79, pas: 69, dri: 87, def: 42, phy: 69 } },
      { id: 'downs', name: 'Damion Downs', pos: 'ST', ovr: 77, stats: { pac: 84, sho: 79, pas: 73, dri: 85, def: 45, phy: 67 } },
      { id: 'emegha', name: 'Sargis Adamyan', pos: 'ST', ovr: 76, stats: { pac: 74, sho: 88, pas: 62, dri: 83, def: 42, phy: 75 } },
      { id: 'maina', name: 'Said El Mala', pos: 'LW', ovr: 76, stats: { pac: 79, sho: 70, pas: 74, dri: 77, def: 42, phy: 71 } },
      { id: 'waldschmidt', name: 'Luca Waldschmidt', pos: 'CAM', ovr: 77, stats: { pac: 76, sho: 80, pas: 89, dri: 77, def: 50, phy: 73 } },
      { id: 'schmitz', name: 'Jonas Urbig Jr', pos: 'GK', ovr: 71, stats: { div: 74, han: 65, kic: 63, ref: 70, spd: 36, pos: 67 } },
      { id: 'chabot', name: 'Max Finkgräfe', pos: 'LB', ovr: 73, stats: { pac: 69, sho: 55, pas: 67, dri: 76, def: 66, phy: 67 } },
      { id: 'huebers', name: 'Eric Martel', pos: 'CDM', ovr: 72, stats: { pac: 58, sho: 57, pas: 66, dri: 68, def: 72, phy: 77 } }
    ]
  },
  {
    id: 'schalke',
    name: 'Schalke 04',
    logo: '⚪🔵',
    squad: [
      { id: 'grabara', name: 'Kamil Grabara', pos: 'GK', ovr: 78, stats: { div: 79, han: 73, kic: 69, ref: 80, spd: 44, pos: 76 } },
      { id: 'brunner', name: 'Sepp van den Berg II', pos: 'CB', ovr: 74, stats: { pac: 63, sho: 50, pas: 71, dri: 63, def: 75, phy: 72 } },
      { id: 'kaminski', name: 'Marcin Kamiński', pos: 'CB', ovr: 74, stats: { pac: 63, sho: 39, pas: 61, dri: 60, def: 77, phy: 77 } },
      { id: 'bulter_p', name: 'Paul Seguin', pos: 'CM', ovr: 73, stats: { pac: 65, sho: 59, pas: 79, dri: 75, def: 66, phy: 72 } },
      { id: 'krauss', name: 'Kenan Karaman', pos: 'RW', ovr: 75, stats: { pac: 85, sho: 79, pas: 75, dri: 84, def: 42, phy: 63 } },
      { id: 'karaman', name: 'Aljoscha Kemlein', pos: 'CM', ovr: 73, stats: { pac: 66, sho: 71, pas: 76, dri: 72, def: 64, phy: 67 } },
      { id: 'murkin', name: 'Ron Schallenberg', pos: 'CDM', ovr: 73, stats: { pac: 69, sho: 53, pas: 72, dri: 72, def: 74, phy: 76 } },
      { id: 'ouedraogo2', name: 'Bryan Lasme', pos: 'ST', ovr: 74, stats: { pac: 76, sho: 77, pas: 62, dri: 71, def: 48, phy: 73 } },
      { id: 'lasme', name: 'Moussa Sylla', pos: 'ST', ovr: 73, stats: { pac: 81, sho: 74, pas: 67, dri: 73, def: 45, phy: 70 } },
      { id: 'seguin', name: 'Tomas Kalinskas', pos: 'RW', ovr: 72, stats: { pac: 78, sho: 76, pas: 62, dri: 81, def: 44, phy: 62 } },
      { id: 'kemlein', name: 'Derry Murkin', pos: 'LB', ovr: 72, stats: { pac: 75, sho: 54, pas: 65, dri: 72, def: 73, phy: 65 } },
      { id: 'brunner2', name: 'Timo Baumgartl', pos: 'CB', ovr: 74, stats: { pac: 69, sho: 43, pas: 66, dri: 61, def: 80, phy: 74 } },
      { id: 'reichert', name: 'Michael Langer', pos: 'GK', ovr: 68, stats: { div: 70, han: 67, kic: 57, ref: 71, spd: 33, pos: 72 } },
      { id: 'krauss2', name: 'Felix Nmecha Jr', pos: 'CM', ovr: 72, stats: { pac: 66, sho: 67, pas: 76, dri: 72, def: 61, phy: 66 } }
    ]
  },
  {
    id: 'elversberg',
    name: 'SV Elversberg',
    logo: '🔴⚪',
    squad: [
      { id: 'kral_j', name: 'Nicolas Kristof', pos: 'GK', ovr: 71, stats: { div: 76, han: 70, kic: 63, ref: 73, spd: 42, pos: 68 } },
      { id: 'bell_j', name: 'Justin Steinkötter', pos: 'CB', ovr: 71, stats: { pac: 59, sho: 45, pas: 63, dri: 59, def: 79, phy: 78 } },
      { id: 'kaufmann_l', name: 'Luca Kerber', pos: 'CB', ovr: 70, stats: { pac: 66, sho: 35, pas: 61, dri: 60, def: 78, phy: 67 } },
      { id: 'gnaka', name: 'Cheick Keita', pos: 'RB', ovr: 71, stats: { pac: 69, sho: 44, pas: 62, dri: 67, def: 73, phy: 65 } },
      { id: 'kerber', name: 'Lukas Fröde', pos: 'CDM', ovr: 71, stats: { pac: 60, sho: 52, pas: 68, dri: 71, def: 77, phy: 72 } },
      { id: 'froede', name: 'Manuel Feil', pos: 'CM', ovr: 70, stats: { pac: 64, sho: 66, pas: 77, dri: 66, def: 64, phy: 66 } },
      { id: 'sontheimer', name: 'Sebastian Mrowca', pos: 'RW', ovr: 71, stats: { pac: 79, sho: 66, pas: 65, dri: 75, def: 38, phy: 55 } },
      { id: 'boukhalfa', name: 'Nils Fröling', pos: 'ST', ovr: 71, stats: { pac: 70, sho: 78, pas: 58, dri: 69, def: 44, phy: 64 } },
      { id: 'drexler', name: 'Elia Drexler', pos: 'ST', ovr: 72, stats: { pac: 73, sho: 75, pas: 68, dri: 69, def: 44, phy: 72 } },
      { id: 'frode', name: 'Julian Günther-Schmidt', pos: 'LW', ovr: 71, stats: { pac: 75, sho: 68, pas: 71, dri: 78, def: 37, phy: 56 } },
      { id: 'feil', name: 'Timo Gebhart', pos: 'CM', ovr: 70, stats: { pac: 63, sho: 60, pas: 77, dri: 68, def: 61, phy: 70 } },
      { id: 'kristof', name: 'Tanju Öztürk', pos: 'GK', ovr: 65, stats: { div: 69, han: 63, kic: 56, ref: 68, spd: 44, pos: 62 } },
      { id: 'steinkotter', name: 'Justin Steinkötter II', pos: 'CB', ovr: 69, stats: { pac: 67, sho: 42, pas: 59, dri: 57, def: 71, phy: 66 } }
    ]
  },
  {
    id: 'paderborn',
    name: 'SC Paderborn',
    logo: '🔵⚫',
    squad: [
      { id: 'vasilj', name: 'Marvin Schwäbe Jr', pos: 'GK', ovr: 71, stats: { div: 75, han: 69, kic: 63, ref: 73, spd: 43, pos: 74 } },
      { id: 'platte', name: 'Lars Lokotsch', pos: 'RB', ovr: 71, stats: { pac: 67, sho: 48, pas: 67, dri: 69, def: 73, phy: 64 } },
      { id: 'gerlach', name: 'Raphael Obermair', pos: 'CB', ovr: 71, stats: { pac: 63, sho: 46, pas: 62, dri: 57, def: 75, phy: 77 } },
      { id: 'justvan', name: 'Julian Justvan', pos: 'CM', ovr: 72, stats: { pac: 68, sho: 67, pas: 75, dri: 66, def: 66, phy: 71 } },
      { id: 'collins_p', name: 'Dennis Srbeny', pos: 'ST', ovr: 72, stats: { pac: 78, sho: 81, pas: 59, dri: 71, def: 37, phy: 72 } },
      { id: 'srbeny', name: 'Filip Bilbija', pos: 'CAM', ovr: 71, stats: { pac: 62, sho: 64, pas: 80, dri: 78, def: 42, phy: 65 } },
      { id: 'michel', name: 'Marvin Pieringer', pos: 'ST', ovr: 72, stats: { pac: 78, sho: 78, pas: 59, dri: 76, def: 41, phy: 69 } },
      { id: 'pieringer', name: 'Ilyas Ansah', pos: 'RW', ovr: 71, stats: { pac: 85, sho: 73, pas: 71, dri: 73, def: 37, phy: 61 } },
      { id: 'ansah', name: 'Robert Wagner', pos: 'CB', ovr: 70, stats: { pac: 56, sho: 46, pas: 59, dri: 53, def: 72, phy: 69 } },
      { id: 'obermair', name: 'Bill Hillebrand', pos: 'CM', ovr: 70, stats: { pac: 68, sho: 63, pas: 74, dri: 69, def: 57, phy: 66 } },
      { id: 'lokotsch', name: 'Sebastian Klaas', pos: 'GK', ovr: 63, stats: { div: 68, han: 65, kic: 59, ref: 63, spd: 32, pos: 59 } },
      { id: 'bilbija', name: 'Felix Platte', pos: 'ST', ovr: 71, stats: { pac: 74, sho: 75, pas: 63, dri: 73, def: 42, phy: 65 } }
    ]
  },
  {
    id: 'psg',
    name: 'Paris Saint-Germain',
    logo: '🔵🔴',
    squad: [
      { id: 'chevalier', name: 'Lucas Chevalier', pos: 'GK', ovr: 84, stats: { div: 88, han: 80, kic: 80, ref: 87, spd: 30, pos: 82 } },
      { id: 'hakimi', name: 'Achraf Hakimi', pos: 'RB', ovr: 87, stats: { pac: 89, sho: 62, pas: 84, dri: 83, def: 82, phy: 85 } },
      { id: 'marquinhos', name: 'Marquinhos', pos: 'CB', ovr: 87, stats: { pac: 76, sho: 60, pas: 83, dri: 74, def: 90, phy: 94 } },
      { id: 'pacho', name: 'Willian Pacho', pos: 'CB', ovr: 84, stats: { pac: 75, sho: 59, pas: 71, dri: 69, def: 90, phy: 81 } },
      { id: 'mendes_n', name: 'Nuno Mendes', pos: 'LB', ovr: 85, stats: { pac: 91, sho: 56, pas: 82, dri: 79, def: 88, phy: 80 } },
      { id: 'vitinha', name: 'Vitinha', pos: 'CDM', ovr: 87, stats: { pac: 81, sho: 73, pas: 87, dri: 83, def: 89, phy: 86 } },
      { id: 'zaire_emery', name: 'Warren Zaïre-Emery', pos: 'CM', ovr: 84, stats: { pac: 82, sho: 72, pas: 93, dri: 80, def: 71, phy: 77 } },
      { id: 'neves_j', name: 'João Neves', pos: 'CM', ovr: 85, stats: { pac: 82, sho: 82, pas: 88, dri: 87, def: 74, phy: 88 } },
      { id: 'doue', name: 'Désiré Doué', pos: 'RW', ovr: 85, stats: { pac: 95, sho: 79, pas: 76, dri: 93, def: 48, phy: 79 } },
      { id: 'barcola', name: 'Bradley Barcola', pos: 'LW', ovr: 84, stats: { pac: 90, sho: 79, pas: 81, dri: 88, def: 53, phy: 70 } },
      { id: 'dembele_o', name: 'Ousmane Dembélé', pos: 'ST', ovr: 89, stats: { pac: 95, sho: 93, pas: 85, dri: 87, def: 63, phy: 91 } },
      { id: 'kvaratskhelia', name: 'Khvicha Kvaratskhelia', pos: 'LW', ovr: 87, stats: { pac: 94, sho: 79, pas: 82, dri: 95, def: 52, phy: 78 } },
      { id: 'safonov', name: 'Matvey Safonov', pos: 'GK', ovr: 78, stats: { div: 75, han: 77, kic: 72, ref: 79, spd: 40, pos: 74 } },
      { id: 'beraldo', name: 'Lucas Beraldo', pos: 'CB', ovr: 80, stats: { pac: 76, sho: 45, pas: 77, dri: 72, def: 89, phy: 82 } },
      { id: 'ruiz_f', name: 'Fabián Ruiz', pos: 'CM', ovr: 83, stats: { pac: 74, sho: 73, pas: 90, dri: 83, def: 80, phy: 76 } },
      { id: 'lee_kang_in', name: 'Lee Kang-in', pos: 'CAM', ovr: 80, stats: { pac: 76, sho: 82, pas: 87, dri: 86, def: 51, phy: 68 } },
      { id: 'ramos_g', name: 'Gonçalo Ramos', pos: 'ST', ovr: 81, stats: { pac: 81, sho: 92, pas: 77, dri: 80, def: 56, phy: 71 } }
    ]
  },
  {
    id: 'marseille',
    name: 'Olympique de Marseille',
    logo: '⚪🔵',
    squad: [
      { id: 'rulli', name: 'Gerónimo Rulli', pos: 'GK', ovr: 81, stats: { div: 83, han: 85, kic: 71, ref: 87, spd: 40, pos: 77 } },
      { id: 'murillo_e', name: 'Emerson Palmieri', pos: 'LB', ovr: 78, stats: { pac: 78, sho: 53, pas: 71, dri: 79, def: 72, phy: 75 } },
      { id: 'balerdi', name: 'Leonardo Balerdi', pos: 'CB', ovr: 80, stats: { pac: 70, sho: 45, pas: 73, dri: 61, def: 85, phy: 85 } },
      { id: 'kondogbia', name: 'Geoffrey Kondogbia', pos: 'CDM', ovr: 79, stats: { pac: 70, sho: 65, pas: 71, dri: 73, def: 78, phy: 83 } },
      { id: 'meite_a', name: 'Amine Harit', pos: 'CAM', ovr: 78, stats: { pac: 70, sho: 77, pas: 82, dri: 82, def: 56, phy: 66 } },
      { id: 'greenwood_m', name: 'Mason Greenwood', pos: 'LW', ovr: 84, stats: { pac: 88, sho: 87, pas: 78, dri: 94, def: 56, phy: 74 } },
      { id: 'hojbjerg', name: 'Pierre-Emile Højbjerg', pos: 'CDM', ovr: 80, stats: { pac: 66, sho: 61, pas: 83, dri: 69, def: 84, phy: 82 } },
      { id: 'vermeeren', name: 'Arthur Vermeeren', pos: 'CM', ovr: 78, stats: { pac: 67, sho: 70, pas: 78, dri: 78, def: 70, phy: 74 } },
      { id: 'weah', name: 'Timothy Weah', pos: 'RW', ovr: 78, stats: { pac: 82, sho: 75, pas: 70, dri: 80, def: 43, phy: 72 } },
      { id: 'aubameyang', name: 'Pierre-Emerick Aubameyang', pos: 'ST', ovr: 81, stats: { pac: 84, sho: 92, pas: 67, dri: 88, def: 51, phy: 80 } },
      { id: 'gouiri', name: 'Amine Gouiri', pos: 'ST', ovr: 79, stats: { pac: 83, sho: 87, pas: 68, dri: 84, def: 45, phy: 72 } },
      { id: 'murillo2', name: 'Facundo Medina', pos: 'CB', ovr: 78, stats: { pac: 64, sho: 47, pas: 70, dri: 62, def: 87, phy: 75 } },
      { id: 'lopez_r', name: 'Rulli Backup', pos: 'GK', ovr: 72, stats: { div: 74, han: 68, kic: 65, ref: 77, spd: 40, pos: 68 } },
      { id: 'brassier', name: 'Quentin Merlin', pos: 'LB', ovr: 77, stats: { pac: 76, sho: 54, pas: 79, dri: 69, def: 76, phy: 73 } },
      { id: 'harit', name: 'Ismaël Koné', pos: 'CM', ovr: 76, stats: { pac: 74, sho: 66, pas: 84, dri: 76, def: 73, phy: 68 } },
      { id: 'nadir', name: 'Robinio Vaz', pos: 'ST', ovr: 73, stats: { pac: 81, sho: 78, pas: 64, dri: 70, def: 40, phy: 72 } }
    ]
  },
  {
    id: 'monaco',
    name: 'AS Monaco',
    logo: '🔴⚪',
    squad: [
      { id: 'majecki', name: 'Radosław Majecki', pos: 'GK', ovr: 78, stats: { div: 81, han: 74, kic: 68, ref: 76, spd: 32, pos: 75 } },
      { id: 'vanderson', name: 'Vanderson', pos: 'RB', ovr: 79, stats: { pac: 79, sho: 61, pas: 81, dri: 80, def: 77, phy: 73 } },
      { id: 'salisu', name: 'Mohammed Salisu', pos: 'CB', ovr: 78, stats: { pac: 73, sho: 53, pas: 73, dri: 66, def: 78, phy: 82 } },
      { id: 'kehrer', name: 'Thilo Kehrer', pos: 'CB', ovr: 78, stats: { pac: 74, sho: 51, pas: 65, dri: 67, def: 80, phy: 76 } },
      { id: 'caio_henrique', name: 'Caio Henrique', pos: 'LB', ovr: 79, stats: { pac: 87, sho: 57, pas: 78, dri: 73, def: 81, phy: 78 } },
      { id: 'minamino', name: 'Mohamed Camara', pos: 'CDM', ovr: 78, stats: { pac: 73, sho: 67, pas: 80, dri: 76, def: 83, phy: 79 } },
      { id: 'ilenikhena', name: 'Denis Zakaria', pos: 'CDM', ovr: 79, stats: { pac: 73, sho: 68, pas: 81, dri: 71, def: 89, phy: 81 } },
      { id: 'coulibaly_s', name: 'Lamine Camara', pos: 'CM', ovr: 78, stats: { pac: 77, sho: 65, pas: 88, dri: 81, def: 67, phy: 80 } },
      { id: 'akliouche', name: 'Maghnes Akliouche', pos: 'CAM', ovr: 81, stats: { pac: 74, sho: 75, pas: 86, dri: 84, def: 57, phy: 78 } },
      { id: 'ben_seghir', name: 'Ansu Fati', pos: 'LW', ovr: 79, stats: { pac: 89, sho: 80, pas: 74, dri: 88, def: 51, phy: 71 } },
      { id: 'embolo', name: 'Breel Embolo', pos: 'ST', ovr: 78, stats: { pac: 86, sho: 88, pas: 69, dri: 75, def: 50, phy: 78 } },
      { id: 'golovin', name: 'Aleksandr Golovin', pos: 'CAM', ovr: 80, stats: { pac: 74, sho: 79, pas: 90, dri: 90, def: 50, phy: 72 } },
      { id: 'nubel_m', name: 'Philipp Köhn', pos: 'GK', ovr: 76, stats: { div: 72, han: 71, kic: 71, ref: 77, spd: 39, pos: 76 } },
      { id: 'teze', name: 'Jordan Teze', pos: 'RB', ovr: 76, stats: { pac: 76, sho: 49, pas: 70, dri: 78, def: 75, phy: 68 } },
      { id: 'zakaria', name: 'Eliesse Ben Seghir', pos: 'RW', ovr: 79, stats: { pac: 82, sho: 74, pas: 77, dri: 84, def: 49, phy: 73 } },
      { id: 'minamino2', name: 'Takumi Minamino', pos: 'ST', ovr: 78, stats: { pac: 76, sho: 86, pas: 64, dri: 84, def: 44, phy: 71 } }
    ]
  },
  {
    id: 'lille',
    name: 'LOSC Lille',
    logo: '🔴⚪',
    squad: [
      { id: 'chevalier_b', name: 'Berke Özer', pos: 'GK', ovr: 78, stats: { div: 84, han: 76, kic: 67, ref: 84, spd: 39, pos: 82 } },
      { id: 'gudmundsson_a', name: 'Alexsandro Ribeiro', pos: 'CB', ovr: 80, stats: { pac: 71, sho: 50, pas: 77, dri: 66, def: 90, phy: 78 } },
      { id: 'diakite_b', name: 'Bafodé Diakité II', pos: 'CB', ovr: 78, stats: { pac: 74, sho: 44, pas: 70, dri: 58, def: 78, phy: 85 } },
      { id: 'meunier_t', name: 'Thomas Meunier', pos: 'RB', ovr: 78, stats: { pac: 79, sho: 58, pas: 71, dri: 74, def: 71, phy: 73 } },
      { id: 'santos_g', name: 'Gabriel Gudmundsson', pos: 'LB', ovr: 76, stats: { pac: 82, sho: 52, pas: 71, dri: 79, def: 79, phy: 72 } },
      { id: 'andre', name: 'André Gomes', pos: 'CDM', ovr: 76, stats: { pac: 61, sho: 63, pas: 73, dri: 75, def: 78, phy: 80 } },
      { id: 'bentaleb', name: 'Nabil Bentaleb', pos: 'CM', ovr: 76, stats: { pac: 72, sho: 67, pas: 80, dri: 78, def: 73, phy: 74 } },
      { id: 'zhegrova', name: 'Edon Zhegrova', pos: 'RW', ovr: 79, stats: { pac: 85, sho: 83, pas: 70, dri: 89, def: 49, phy: 70 } },
      { id: 'cabella', name: 'Rémy Cabella', pos: 'CAM', ovr: 76, stats: { pac: 71, sho: 77, pas: 87, dri: 85, def: 55, phy: 62 } },
      { id: 'haraldsson', name: 'Ayyoub Bouaddi', pos: 'CM', ovr: 75, stats: { pac: 67, sho: 63, pas: 84, dri: 80, def: 63, phy: 74 } },
      { id: 'igamane', name: 'Mohamed Bayo', pos: 'ST', ovr: 76, stats: { pac: 80, sho: 77, pas: 67, dri: 81, def: 48, phy: 69 } },
      { id: 'yazici_j', name: 'Jonathan David II', pos: 'ST', ovr: 80, stats: { pac: 86, sho: 83, pas: 73, dri: 81, def: 56, phy: 78 } },
      { id: 'ozer', name: 'Vito Mannone', pos: 'GK', ovr: 71, stats: { div: 75, han: 72, kic: 62, ref: 78, spd: 40, pos: 73 } },
      { id: 'gomes_a', name: 'Aïssa Mandi', pos: 'CB', ovr: 77, stats: { pac: 66, sho: 43, pas: 70, dri: 67, def: 85, phy: 77 } },
      { id: 'bouaddi', name: 'Ángel Gomes', pos: 'CAM', ovr: 78, stats: { pac: 70, sho: 76, pas: 89, dri: 80, def: 57, phy: 66 } }
    ]
  },
  {
    id: 'lyon',
    name: 'Olympique Lyonnais',
    logo: '🔵🔴',
    squad: [
      { id: 'greif', name: 'Dominik Greif', pos: 'GK', ovr: 79, stats: { div: 78, han: 74, kic: 69, ref: 80, spd: 44, pos: 84 } },
      { id: 'mata_n', name: 'Nicolás Tagliafico', pos: 'LB', ovr: 78, stats: { pac: 76, sho: 52, pas: 79, dri: 72, def: 74, phy: 71 } },
      { id: 'niakhate', name: 'Moussa Niakhaté', pos: 'CB', ovr: 78, stats: { pac: 65, sho: 45, pas: 69, dri: 63, def: 88, phy: 77 } },
      { id: 'abner', name: 'Abner', pos: 'LB', ovr: 76, stats: { pac: 74, sho: 57, pas: 71, dri: 78, def: 76, phy: 73 } },
      { id: 'kluivert_j', name: 'Justin Lonwijk', pos: 'RB', ovr: 76, stats: { pac: 76, sho: 48, pas: 75, dri: 74, def: 75, phy: 72 } },
      { id: 'tolisso', name: 'Corentin Tolisso', pos: 'CM', ovr: 79, stats: { pac: 76, sho: 68, pas: 81, dri: 84, def: 71, phy: 74 } },
      { id: 'caleta_car', name: 'Duje Ćaleta-Car', pos: 'CB', ovr: 77, stats: { pac: 71, sho: 44, pas: 72, dri: 57, def: 85, phy: 80 } },
      { id: 'morton', name: 'Tanner Tessmann', pos: 'CDM', ovr: 76, stats: { pac: 64, sho: 67, pas: 71, dri: 67, def: 75, phy: 79 } },
      { id: 'cherki2', name: 'Bafodé Diakité Jr', pos: 'CAM', ovr: 84, stats: { pac: 83, sho: 84, pas: 89, dri: 94, def: 55, phy: 74 } },
      { id: 'mikautadze_g', name: 'Afonso Moreira', pos: 'RW', ovr: 76, stats: { pac: 86, sho: 80, pas: 74, dri: 84, def: 47, phy: 65 } },
      { id: 'fofana_m', name: 'Malick Fofana', pos: 'LW', ovr: 79, stats: { pac: 92, sho: 80, pas: 73, dri: 84, def: 51, phy: 67 } },
      { id: 'satriano', name: 'Martin Satriano', pos: 'ST', ovr: 76, stats: { pac: 75, sho: 86, pas: 68, dri: 78, def: 48, phy: 77 } },
      { id: 'descamps', name: 'Rémy Descamps', pos: 'GK', ovr: 74, stats: { div: 71, han: 71, kic: 62, ref: 75, spd: 37, pos: 78 } },
      { id: 'lopes', name: 'Adryelson', pos: 'CB', ovr: 75, stats: { pac: 69, sho: 46, pas: 66, dri: 62, def: 76, phy: 81 } },
      { id: 'benrahma', name: 'Saïd Benrahma', pos: 'LW', ovr: 78, stats: { pac: 89, sho: 80, pas: 70, dri: 86, def: 49, phy: 68 } }
    ]
  },
  {
    id: 'lens',
    name: 'RC Lens',
    logo: '🟡🔴',
    squad: [
      { id: 'samba', name: 'Brice Samba', pos: 'GK', ovr: 80, stats: { div: 85, han: 83, kic: 74, ref: 85, spd: 39, pos: 84 } },
      { id: 'gradit', name: 'Jonathan Gradit', pos: 'CB', ovr: 78, stats: { pac: 66, sho: 50, pas: 72, dri: 65, def: 79, phy: 75 } },
      { id: 'medina_f', name: 'Facundo Medina II', pos: 'CB', ovr: 78, stats: { pac: 71, sho: 52, pas: 67, dri: 61, def: 79, phy: 75 } },
      { id: 'haidara_m', name: 'Massadio Haïdara', pos: 'LB', ovr: 75, stats: { pac: 79, sho: 57, pas: 75, dri: 71, def: 75, phy: 64 } },
      { id: 'machado_d', name: 'Deiver Machado', pos: 'RB', ovr: 75, stats: { pac: 81, sho: 49, pas: 65, dri: 75, def: 69, phy: 66 } },
      { id: 'sotoca', name: 'Florian Sotoca', pos: 'ST', ovr: 77, stats: { pac: 75, sho: 82, pas: 70, dri: 83, def: 41, phy: 77 } },
      { id: 'mendy_a', name: 'Adrien Thomasson', pos: 'CM', ovr: 76, stats: { pac: 65, sho: 65, pas: 82, dri: 74, def: 66, phy: 75 } },
      { id: 'fofana_s', name: 'Salis Abdul Samed', pos: 'CDM', ovr: 77, stats: { pac: 64, sho: 67, pas: 72, dri: 75, def: 85, phy: 79 } },
      { id: 'thomasson', name: 'Wesley Saïd', pos: 'RW', ovr: 75, stats: { pac: 77, sho: 76, pas: 65, dri: 81, def: 42, phy: 60 } },
      { id: 'said', name: 'Angelo Fulgini', pos: 'CAM', ovr: 76, stats: { pac: 74, sho: 77, pas: 83, dri: 81, def: 52, phy: 69 } },
      { id: 'kalimuendo', name: 'Arnaud Kalimuendo', pos: 'ST', ovr: 79, stats: { pac: 79, sho: 89, pas: 77, dri: 85, def: 55, phy: 73 } },
      { id: 'abdul_samed', name: 'Przemysław Frankowski', pos: 'RB', ovr: 75, stats: { pac: 83, sho: 46, pas: 71, dri: 69, def: 72, phy: 71 } },
      { id: 'leplat', name: 'Yehvann Diouf', pos: 'GK', ovr: 73, stats: { div: 76, han: 72, kic: 63, ref: 72, spd: 35, pos: 71 } },
      { id: 'el_aynaoui', name: 'Neil El Aynaoui', pos: 'CM', ovr: 77, stats: { pac: 67, sho: 72, pas: 81, dri: 76, def: 65, phy: 77 } },
      { id: 'fulgini', name: 'Ivan Fresneda', pos: 'RB', ovr: 75, stats: { pac: 73, sho: 48, pas: 72, dri: 75, def: 79, phy: 72 } }
    ]
  },
  {
    id: 'nice',
    name: 'OGC Nice',
    logo: '🔴⚫',
    squad: [
      { id: 'bulka', name: 'Marcin Bułka', pos: 'GK', ovr: 79, stats: { div: 84, han: 82, kic: 73, ref: 83, spd: 30, pos: 76 } },
      { id: 'bard', name: 'Melvin Bard', pos: 'LB', ovr: 77, stats: { pac: 73, sho: 57, pas: 76, dri: 77, def: 72, phy: 69 } },
      { id: 'todibo', name: 'Jean-Clair Todibo', pos: 'CB', ovr: 80, stats: { pac: 68, sho: 52, pas: 78, dri: 64, def: 79, phy: 78 } },
      { id: 'rosario', name: 'Dante Rosario', pos: 'CB', ovr: 76, stats: { pac: 66, sho: 51, pas: 72, dri: 61, def: 75, phy: 73 } },
      { id: 'clauss', name: 'Jonathan Clauss', pos: 'RB', ovr: 77, stats: { pac: 75, sho: 56, pas: 73, dri: 81, def: 80, phy: 75 } },
      { id: 'boudaoui', name: 'Sofiane Diop', pos: 'CAM', ovr: 77, stats: { pac: 73, sho: 79, pas: 79, dri: 78, def: 54, phy: 69 } },
      { id: 'vanhoutte', name: 'Morgan Sanson', pos: 'CM', ovr: 75, stats: { pac: 66, sho: 64, pas: 73, dri: 80, def: 70, phy: 78 } },
      { id: 'bouanani', name: 'Badredine Bouanani', pos: 'RW', ovr: 77, stats: { pac: 91, sho: 74, pas: 76, dri: 82, def: 49, phy: 71 } },
      { id: 'diop_s', name: 'Evann Guessand', pos: 'ST', ovr: 77, stats: { pac: 76, sho: 77, pas: 66, dri: 80, def: 46, phy: 67 } },
      { id: 'moffi', name: 'Terem Moffi', pos: 'ST', ovr: 79, stats: { pac: 86, sho: 88, pas: 71, dri: 76, def: 54, phy: 75 } },
      { id: 'laborde', name: 'Gaëtan Laborde', pos: 'ST', ovr: 77, stats: { pac: 75, sho: 81, pas: 70, dri: 84, def: 47, phy: 75 } },
      { id: 'sanson', name: 'Tanguy Ndombele', pos: 'CM', ovr: 76, stats: { pac: 66, sho: 65, pas: 85, dri: 75, def: 63, phy: 75 } },
      { id: 'diaw', name: 'Yehvann Diaw', pos: 'GK', ovr: 71, stats: { div: 68, han: 67, kic: 63, ref: 74, spd: 39, pos: 73 } },
      { id: 'rosario2', name: 'Antoine Mendy', pos: 'RB', ovr: 74, stats: { pac: 75, sho: 45, pas: 73, dri: 67, def: 72, phy: 67 } },
      { id: 'guessand', name: 'Hicham Boudaoui', pos: 'CM', ovr: 75, stats: { pac: 71, sho: 70, pas: 76, dri: 77, def: 69, phy: 73 } }
    ]
  },
  {
    id: 'rennes',
    name: 'Stade Rennais',
    logo: '🔴⚫',
    squad: [
      { id: 'samba_a', name: 'Brice Samba II', pos: 'GK', ovr: 76, stats: { div: 73, han: 79, kic: 69, ref: 74, spd: 33, pos: 81 } },
      { id: 'rouault_a', name: 'Adrien Truffert', pos: 'LB', ovr: 78, stats: { pac: 77, sho: 53, pas: 77, dri: 80, def: 78, phy: 75 } },
      { id: 'wooh', name: 'Christopher Wooh', pos: 'CB', ovr: 76, stats: { pac: 62, sho: 41, pas: 74, dri: 66, def: 74, phy: 73 } },
      { id: 'meite_o', name: 'Sacha Bataille', pos: 'CB', ovr: 75, stats: { pac: 64, sho: 50, pas: 64, dri: 63, def: 84, phy: 79 } },
      { id: 'assignon', name: 'Lorenz Assignon', pos: 'RB', ovr: 76, stats: { pac: 83, sho: 49, pas: 68, dri: 68, def: 77, phy: 65 } },
      { id: 'blas', name: 'Fresnel Iyombo', pos: 'CM', ovr: 75, stats: { pac: 75, sho: 70, pas: 75, dri: 79, def: 63, phy: 73 } },
      { id: 'rongier', name: 'Seko Fofana', pos: 'CDM', ovr: 79, stats: { pac: 64, sho: 68, pas: 82, dri: 78, def: 77, phy: 85 } },
      { id: 'kalimuendo_r', name: 'Ludovic Blas', pos: 'CAM', ovr: 77, stats: { pac: 74, sho: 79, pas: 83, dri: 84, def: 54, phy: 73 } },
      { id: 'embolo_r', name: 'Jota Silva', pos: 'RW', ovr: 76, stats: { pac: 79, sho: 69, pas: 73, dri: 79, def: 43, phy: 60 } },
      { id: 'bourigeaud', name: 'Benjamin Bourigeaud', pos: 'CM', ovr: 76, stats: { pac: 73, sho: 62, pas: 84, dri: 80, def: 67, phy: 69 } },
      { id: 'gouiri_r', name: 'Amine Gouiri II', pos: 'ST', ovr: 78, stats: { pac: 83, sho: 80, pas: 69, dri: 75, def: 54, phy: 75 } },
      { id: 'truffert', name: 'Anthony Rouault', pos: 'CB', ovr: 75, stats: { pac: 65, sho: 40, pas: 70, dri: 65, def: 83, phy: 72 } },
      { id: 'mandanda', name: 'Steve Mandanda', pos: 'GK', ovr: 76, stats: { div: 76, han: 73, kic: 71, ref: 74, spd: 39, pos: 81 } },
      { id: 'fofana_seko', name: 'Glen Kamara', pos: 'CDM', ovr: 75, stats: { pac: 68, sho: 55, pas: 68, dri: 64, def: 81, phy: 78 } },
      { id: 'silva_j', name: 'Cyril Ngonge', pos: 'LW', ovr: 76, stats: { pac: 84, sho: 73, pas: 71, dri: 83, def: 46, phy: 71 } }
    ]
  },
  {
    id: 'strasbourg',
    name: 'RC Strasbourg',
    logo: '🔵⚪',
    squad: [
      { id: 'penders', name: 'Kevin Trapp II', pos: 'GK', ovr: 74, stats: { div: 77, han: 76, kic: 70, ref: 79, spd: 40, pos: 69 } },
      { id: 'sissoko_a', name: 'Abakar Sylla', pos: 'CB', ovr: 76, stats: { pac: 70, sho: 50, pas: 67, dri: 67, def: 76, phy: 83 } },
      { id: 'nyamsi', name: 'Guela Doué', pos: 'RB', ovr: 76, stats: { pac: 77, sho: 54, pas: 69, dri: 72, def: 72, phy: 68 } },
      { id: 'mwanga', name: 'Mamadou Sarr', pos: 'CB', ovr: 75, stats: { pac: 62, sho: 44, pas: 73, dri: 63, def: 84, phy: 80 } },
      { id: 'doue_g', name: 'Junior Mwanga', pos: 'LB', ovr: 74, stats: { pac: 80, sho: 56, pas: 73, dri: 69, def: 69, phy: 67 } },
      { id: 'sarr_m', name: 'Habib Diarra II', pos: 'CM', ovr: 78, stats: { pac: 66, sho: 67, pas: 87, dri: 83, def: 68, phy: 79 } },
      { id: 'diarra_h', name: 'Andrey Santos II', pos: 'CDM', ovr: 76, stats: { pac: 69, sho: 67, pas: 78, dri: 70, def: 75, phy: 82 } },
      { id: 'bakwa', name: 'Dilane Bakwa', pos: 'RW', ovr: 78, stats: { pac: 84, sho: 78, pas: 72, dri: 84, def: 52, phy: 64 } },
      { id: 'emegha_s', name: 'Emanuel Emegha', pos: 'ST', ovr: 77, stats: { pac: 80, sho: 85, pas: 69, dri: 84, def: 46, phy: 78 } },
      { id: 'sahi_dion', name: 'Sebastian Nanasi', pos: 'LW', ovr: 76, stats: { pac: 86, sho: 80, pas: 67, dri: 79, def: 41, phy: 71 } },
      { id: 'ouattara_a', name: 'Abdoul Ouattara', pos: 'CM', ovr: 74, stats: { pac: 62, sho: 63, pas: 81, dri: 80, def: 62, phy: 71 } },
      { id: 'sylla_a', name: 'Saïdou Sow', pos: 'CB', ovr: 74, stats: { pac: 68, sho: 46, pas: 69, dri: 63, def: 75, phy: 73 } },
      { id: 'marchetti', name: 'Alaa Bellaarouch', pos: 'GK', ovr: 68, stats: { div: 64, han: 69, kic: 57, ref: 68, spd: 44, pos: 69 } },
      { id: 'diarra2s', name: 'Dilane Bakwa II', pos: 'RW', ovr: 75, stats: { pac: 84, sho: 75, pas: 72, dri: 83, def: 41, phy: 60 } },
      { id: 'nanasi', name: 'Félix Lemaréchal', pos: 'CAM', ovr: 75, stats: { pac: 66, sho: 67, pas: 79, dri: 77, def: 46, phy: 67 } }
    ]
  },
  {
    id: 'toulouse',
    name: 'Toulouse FC',
    logo: '🟣',
    squad: [
      { id: 'restes', name: 'Guillaume Restes', pos: 'GK', ovr: 77, stats: { div: 83, han: 78, kic: 67, ref: 82, spd: 32, pos: 73 } },
      { id: 'nicolaisen', name: 'Rasmus Nicolaisen', pos: 'CB', ovr: 76, stats: { pac: 66, sho: 45, pas: 70, dri: 61, def: 83, phy: 73 } },
      { id: 'sidibe_a', name: 'Moussa Diarra', pos: 'CB', ovr: 75, stats: { pac: 72, sho: 43, pas: 71, dri: 55, def: 83, phy: 74 } },
      { id: 'costa_v', name: 'Vitor Costa', pos: 'RB', ovr: 74, stats: { pac: 80, sho: 54, pas: 72, dri: 69, def: 66, phy: 64 } },
      { id: 'spierings', name: 'Rowen Spierings', pos: 'CM', ovr: 74, stats: { pac: 73, sho: 62, pas: 80, dri: 75, def: 68, phy: 68 } },
      { id: 'sierro', name: 'Denis Genreau', pos: 'CDM', ovr: 75, stats: { pac: 61, sho: 56, pas: 79, dri: 68, def: 81, phy: 78 } },
      { id: 'magri', name: 'Aron Dønnum', pos: 'LW', ovr: 76, stats: { pac: 81, sho: 69, pas: 66, dri: 86, def: 40, phy: 72 } },
      { id: 'dallinga', name: 'Thijs Dallinga', pos: 'ST', ovr: 78, stats: { pac: 79, sho: 87, pas: 66, dri: 83, def: 45, phy: 72 } },
      { id: 'genreau', name: 'Rafael Ratão', pos: 'ST', ovr: 75, stats: { pac: 78, sho: 76, pas: 64, dri: 81, def: 42, phy: 70 } },
      { id: 'donnum', name: 'Cristian Cásseres', pos: 'CM', ovr: 74, stats: { pac: 71, sho: 63, pas: 74, dri: 71, def: 65, phy: 70 } },
      { id: 'diarra_m', name: 'Ibrahim Cissoko', pos: 'RW', ovr: 75, stats: { pac: 85, sho: 73, pas: 75, dri: 76, def: 45, phy: 69 } },
      { id: 'nicolaisen2', name: 'Anthony Rouault Toulouse', pos: 'CB', ovr: 74, stats: { pac: 63, sho: 38, pas: 65, dri: 55, def: 78, phy: 79 } },
      { id: 'dupe', name: 'Maxence Dupé', pos: 'GK', ovr: 71, stats: { div: 68, han: 66, kic: 63, ref: 70, spd: 33, pos: 70 } },
      { id: 'cissoko', name: 'Farid El Melali', pos: 'RW', ovr: 74, stats: { pac: 77, sho: 67, pas: 68, dri: 80, def: 47, phy: 65 } }
    ]
  },
  {
    id: 'brest',
    name: 'Stade Brestois',
    logo: '🔴⚪',
    squad: [
      { id: 'bizot_m', name: 'Marco Bizot Brest', pos: 'GK', ovr: 78, stats: { div: 75, han: 74, kic: 72, ref: 81, spd: 43, pos: 83 } },
      { id: 'chardonnet', name: 'Bastien Meupiyou', pos: 'CB', ovr: 74, stats: { pac: 70, sho: 39, pas: 71, dri: 60, def: 75, phy: 72 } },
      { id: 'doumbia_l', name: 'Lilian Brassier', pos: 'CB', ovr: 76, stats: { pac: 72, sho: 43, pas: 63, dri: 59, def: 85, phy: 78 } },
      { id: 'locko', name: 'Jonas Martin', pos: 'LB', ovr: 74, stats: { pac: 79, sho: 45, pas: 69, dri: 70, def: 68, phy: 70 } },
      { id: 'lala', name: 'Kenny Lala', pos: 'RB', ovr: 74, stats: { pac: 74, sho: 45, pas: 76, dri: 72, def: 68, phy: 62 } },
      { id: 'magnetti', name: 'Hugo Magnetti', pos: 'CM', ovr: 74, stats: { pac: 70, sho: 66, pas: 72, dri: 74, def: 69, phy: 72 } },
      { id: 'pierre_gabriel', name: 'Pierre Lees-Melou', pos: 'CM', ovr: 76, stats: { pac: 67, sho: 68, pas: 81, dri: 78, def: 64, phy: 78 } },
      { id: 'sima', name: 'Steve Mounié', pos: 'ST', ovr: 76, stats: { pac: 84, sho: 85, pas: 72, dri: 76, def: 51, phy: 68 } },
      { id: 'salibur', name: 'Romain Del Castillo', pos: 'RW', ovr: 75, stats: { pac: 80, sho: 74, pas: 76, dri: 76, def: 40, phy: 59 } },
      { id: 'lees_melou', name: 'Mathias Pereira Lage', pos: 'LW', ovr: 75, stats: { pac: 82, sho: 69, pas: 67, dri: 84, def: 44, phy: 70 } },
      { id: 'honorat_m', name: 'Ludovic Ajorque', pos: 'ST', ovr: 75, stats: { pac: 77, sho: 83, pas: 61, dri: 82, def: 42, phy: 71 } },
      { id: 'brassier_l', name: 'Bradley Locko', pos: 'LB', ovr: 74, stats: { pac: 76, sho: 55, pas: 70, dri: 78, def: 73, phy: 65 } },
      { id: 'gueguen', name: 'Grégoire Boyer', pos: 'GK', ovr: 67, stats: { div: 71, han: 63, kic: 64, ref: 69, spd: 33, pos: 72 } },
      { id: 'mounie', name: 'Abdallah Sima', pos: 'RW', ovr: 76, stats: { pac: 82, sho: 73, pas: 70, dri: 84, def: 38, phy: 64 } }
    ]
  },
  {
    id: 'le_havre',
    name: 'Le Havre AC',
    logo: '🔵',
    squad: [
      { id: 'lavigne', name: 'Arthur Desmas', pos: 'GK', ovr: 74, stats: { div: 72, han: 76, kic: 61, ref: 77, spd: 33, pos: 74 } },
      { id: 'bagui', name: 'Mickaël Alphonse', pos: 'CB', ovr: 73, stats: { pac: 66, sho: 46, pas: 61, dri: 56, def: 72, phy: 81 } },
      { id: 'desmas', name: 'Basile Santoro', pos: 'CDM', ovr: 73, stats: { pac: 59, sho: 55, pas: 71, dri: 68, def: 82, phy: 70 } },
      { id: 'doucet_a', name: 'Yassine Kechta', pos: 'CAM', ovr: 74, stats: { pac: 67, sho: 68, pas: 81, dri: 79, def: 49, phy: 71 } },
      { id: 'kechta', name: 'Rassoul Ndiaye', pos: 'CB', ovr: 73, stats: { pac: 67, sho: 47, pas: 70, dri: 56, def: 82, phy: 74 } },
      { id: 'touba', name: 'Daler Kuzyaev', pos: 'CM', ovr: 74, stats: { pac: 63, sho: 71, pas: 73, dri: 68, def: 63, phy: 69 } },
      { id: 'lekhal', name: 'Josué Casimir', pos: 'RW', ovr: 73, stats: { pac: 87, sho: 75, pas: 68, dri: 79, def: 45, phy: 67 } },
      { id: 'gning', name: 'Ismaël Diakité', pos: 'RB', ovr: 72, stats: { pac: 76, sho: 48, pas: 63, dri: 67, def: 72, phy: 67 } },
      { id: 'ndiaye_r', name: 'Mathurin Meschede', pos: 'ST', ovr: 73, stats: { pac: 80, sho: 84, pas: 71, dri: 71, def: 38, phy: 74 } },
      { id: 'meschede', name: 'Yannis Clementia', pos: 'LW', ovr: 73, stats: { pac: 82, sho: 67, pas: 71, dri: 76, def: 38, phy: 61 } },
      { id: 'casimir', name: 'Arouna Sanganté', pos: 'ST', ovr: 72, stats: { pac: 75, sho: 80, pas: 59, dri: 77, def: 43, phy: 68 } },
      { id: 'clementia', name: 'Etienne Youte Kinkoue', pos: 'CB', ovr: 72, stats: { pac: 66, sho: 46, pas: 58, dri: 58, def: 78, phy: 77 } },
      { id: 'kalouma', name: 'Rémy Riou', pos: 'GK', ovr: 66, stats: { div: 68, han: 62, kic: 63, ref: 71, spd: 33, pos: 65 } },
      { id: 'kuzyaev', name: 'André Ayew', pos: 'ST', ovr: 76, stats: { pac: 84, sho: 78, pas: 67, dri: 84, def: 51, phy: 69 } }
    ]
  },
  {
    id: 'auxerre',
    name: 'AJ Auxerre',
    logo: '⚪🔵',
    squad: [
      { id: 'leon_d', name: 'Donovan Léon', pos: 'GK', ovr: 75, stats: { div: 78, han: 73, kic: 69, ref: 80, spd: 31, pos: 72 } },
      { id: 'hein_j', name: 'Jubal Rocha', pos: 'CB', ovr: 73, stats: { pac: 62, sho: 40, pas: 59, dri: 55, def: 76, phy: 74 } },
      { id: 'rocha', name: 'Jim Allevinah', pos: 'RW', ovr: 74, stats: { pac: 77, sho: 73, pas: 75, dri: 81, def: 40, phy: 66 } },
      { id: 'lopes_e', name: 'Elisha Owusu', pos: 'CDM', ovr: 74, stats: { pac: 63, sho: 56, pas: 72, dri: 62, def: 80, phy: 72 } },
      { id: 'allevinah', name: 'Gauthier Hein', pos: 'LW', ovr: 75, stats: { pac: 81, sho: 79, pas: 74, dri: 85, def: 45, phy: 67 } },
      { id: 'perrin_l', name: 'Lassine Sinayoko', pos: 'ST', ovr: 75, stats: { pac: 80, sho: 87, pas: 63, dri: 80, def: 43, phy: 68 } },
      { id: 'owusu_e', name: 'Ousseynou Ba', pos: 'CB', ovr: 73, stats: { pac: 69, sho: 44, pas: 69, dri: 64, def: 78, phy: 71 } },
      { id: 'sinayoko', name: 'Rayan Raveloson', pos: 'CM', ovr: 74, stats: { pac: 62, sho: 66, pas: 81, dri: 71, def: 61, phy: 66 } },
      { id: 'raveloson', name: 'Perruzzi Charles-Cook', pos: 'ST', ovr: 72, stats: { pac: 71, sho: 80, pas: 58, dri: 71, def: 39, phy: 71 } },
      { id: 'hunou', name: 'Yoann Touzghar', pos: 'ST', ovr: 74, stats: { pac: 83, sho: 74, pas: 61, dri: 81, def: 50, phy: 66 } },
      { id: 'ba_o', name: 'Jubal', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 43, pas: 63, dri: 58, def: 77, phy: 72 } },
      { id: 'boye_a', name: 'Anthony Rouault Auxerre', pos: 'RB', ovr: 71, stats: { pac: 68, sho: 42, pas: 63, dri: 64, def: 70, phy: 67 } },
      { id: 'leon2', name: 'Théo Percot', pos: 'GK', ovr: 63, stats: { div: 62, han: 65, kic: 57, ref: 63, spd: 37, pos: 60 } }
    ]
  },
  {
    id: 'angers',
    name: 'Angers SCO',
    logo: '⚫⚪',
    squad: [
      { id: 'koffi_l', name: 'Lucas Perrin', pos: 'CB', ovr: 73, stats: { pac: 70, sho: 44, pas: 60, dri: 55, def: 79, phy: 74 } },
      { id: 'perrin_a', name: 'Yahia Fofana', pos: 'GK', ovr: 74, stats: { div: 77, han: 70, kic: 69, ref: 79, spd: 31, pos: 75 } },
      { id: 'bakayoko_a', name: 'Christian Kouamé', pos: 'ST', ovr: 74, stats: { pac: 73, sho: 82, pas: 70, dri: 79, def: 41, phy: 65 } },
      { id: 'fofana_y', name: 'Abdoulaye Bamba', pos: 'CB', ovr: 72, stats: { pac: 66, sho: 43, pas: 60, dri: 54, def: 77, phy: 69 } },
      { id: 'ekwah', name: 'Pierre Ekwah', pos: 'CM', ovr: 73, stats: { pac: 69, sho: 62, pas: 74, dri: 72, def: 65, phy: 74 } },
      { id: 'cabot', name: 'Lilian Raolisoa', pos: 'CB', ovr: 71, stats: { pac: 57, sho: 44, pas: 60, dri: 54, def: 77, phy: 75 } },
      { id: 'capelle', name: 'Thomas Mangani', pos: 'CDM', ovr: 72, stats: { pac: 63, sho: 63, pas: 66, dri: 64, def: 78, phy: 71 } },
      { id: 'mangani', name: 'Himad Abdelli', pos: 'CAM', ovr: 74, stats: { pac: 66, sho: 69, pas: 83, dri: 84, def: 53, phy: 72 } },
      { id: 'abdelli', name: 'Esteban Lepaul', pos: 'ST', ovr: 75, stats: { pac: 82, sho: 79, pas: 65, dri: 80, def: 40, phy: 72 } },
      { id: 'lepaul', name: 'Mohamed-Ali Cho', pos: 'RW', ovr: 74, stats: { pac: 77, sho: 67, pas: 70, dri: 76, def: 47, phy: 69 } },
      { id: 'cho', name: 'Rayan Fofana', pos: 'LW', ovr: 72, stats: { pac: 80, sho: 66, pas: 63, dri: 78, def: 40, phy: 60 } },
      { id: 'bamba_a', name: 'Jim Allevinah Angers', pos: 'RW', ovr: 71, stats: { pac: 82, sho: 69, pas: 70, dri: 72, def: 34, phy: 60 } },
      { id: 'koffi2', name: 'Bingourou Kamara', pos: 'GK', ovr: 62, stats: { div: 63, han: 59, kic: 56, ref: 61, spd: 34, pos: 62 } }
    ]
  },
  {
    id: 'lorient',
    name: 'FC Lorient',
    logo: '⚫🟠',
    squad: [
      { id: 'descamps_y', name: 'Yvon Mvogo', pos: 'GK', ovr: 75, stats: { div: 78, han: 77, kic: 66, ref: 76, spd: 44, pos: 79 } },
      { id: 'lautoa', name: 'Julien Laporte', pos: 'CB', ovr: 73, stats: { pac: 66, sho: 38, pas: 64, dri: 61, def: 74, phy: 69 } },
      { id: 'kalulu_a', name: 'Bamo Meïté', pos: 'CB', ovr: 73, stats: { pac: 71, sho: 48, pas: 61, dri: 59, def: 78, phy: 73 } },
      { id: 'lopes_t', name: 'Théo Le Bris', pos: 'RW', ovr: 74, stats: { pac: 77, sho: 75, pas: 73, dri: 79, def: 37, phy: 63 } },
      { id: 'le_bris', name: 'Igor Silva', pos: 'RB', ovr: 72, stats: { pac: 69, sho: 54, pas: 63, dri: 67, def: 73, phy: 62 } },
      { id: 'makengo', name: 'Sambou Sissoko', pos: 'CM', ovr: 73, stats: { pac: 62, sho: 60, pas: 73, dri: 73, def: 69, phy: 67 } },
      { id: 'sissoko_s', name: 'Bilal Traoré', pos: 'LW', ovr: 73, stats: { pac: 77, sho: 74, pas: 68, dri: 77, def: 36, phy: 60 } },
      { id: 'leborgne', name: 'Pierre-Yves Hamel', pos: 'ST', ovr: 73, stats: { pac: 82, sho: 74, pas: 62, dri: 78, def: 48, phy: 74 } },
      { id: 'mvogo', name: 'Théo Le Bris Jr', pos: 'CAM', ovr: 75, stats: { pac: 71, sho: 78, pas: 82, dri: 78, def: 51, phy: 70 } },
      { id: 'meite_b', name: 'Julien Ponceau', pos: 'CB', ovr: 71, stats: { pac: 66, sho: 37, pas: 59, dri: 62, def: 70, phy: 77 } },
      { id: 'traore_b', name: 'Bamba Fofana', pos: 'CM', ovr: 71, stats: { pac: 63, sho: 60, pas: 72, dri: 71, def: 69, phy: 65 } },
      { id: 'hamel', name: 'Aiyegun Tosin', pos: 'ST', ovr: 72, stats: { pac: 79, sho: 76, pas: 60, dri: 77, def: 40, phy: 64 } },
      { id: 'bardy', name: 'Marco Bizot Lorient Backup', pos: 'GK', ovr: 62, stats: { div: 62, han: 64, kic: 58, ref: 65, spd: 30, pos: 65 } }
    ]
  },
  {
    id: 'paris_fc',
    name: 'Paris FC',
    logo: '🔵🔴',
    squad: [
      { id: 'himbert', name: 'Obed Nkambadio', pos: 'GK', ovr: 71, stats: { div: 73, han: 74, kic: 68, ref: 71, spd: 43, pos: 74 } },
      { id: 'nkambadio', name: 'Ryan Ngoumou', pos: 'RB', ovr: 71, stats: { pac: 70, sho: 45, pas: 65, dri: 67, def: 68, phy: 60 } },
      { id: 'ngoumou_r', name: 'Otávio Monteiro', pos: 'CB', ovr: 72, stats: { pac: 61, sho: 47, pas: 63, dri: 60, def: 81, phy: 77 } },
      { id: 'marchetti_p', name: 'Chris Bedia', pos: 'ST', ovr: 73, stats: { pac: 73, sho: 84, pas: 69, dri: 81, def: 46, phy: 72 } },
      { id: 'bedia', name: 'Ilan Kebbal', pos: 'CAM', ovr: 73, stats: { pac: 73, sho: 68, pas: 81, dri: 78, def: 53, phy: 61 } },
      { id: 'kebbal', name: 'Sadio Diallo', pos: 'CM', ovr: 72, stats: { pac: 66, sho: 62, pas: 80, dri: 70, def: 68, phy: 74 } },
      { id: 'diallo_s', name: 'Yassine Benzia', pos: 'LW', ovr: 74, stats: { pac: 87, sho: 68, pas: 75, dri: 83, def: 44, phy: 66 } },
      { id: 'benzia', name: 'Vincent Marchetti', pos: 'CB', ovr: 71, stats: { pac: 58, sho: 45, pas: 64, dri: 56, def: 73, phy: 76 } },
      { id: 'monteiro', name: 'Stef Peeters', pos: 'CDM', ovr: 71, stats: { pac: 64, sho: 61, pas: 66, dri: 63, def: 72, phy: 68 } },
      { id: 'bahoya', name: 'Zinedine Machach', pos: 'RW', ovr: 71, stats: { pac: 77, sho: 63, pas: 71, dri: 74, def: 34, phy: 56 } },
      { id: 'machach', name: 'Moussa Sylla Paris', pos: 'ST', ovr: 71, stats: { pac: 77, sho: 73, pas: 63, dri: 72, def: 45, phy: 72 } },
      { id: 'peeters', name: 'Andy Pelmard', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 43, pas: 68, dri: 57, def: 80, phy: 76 } },
      { id: 'himbert2', name: 'Lucas Perri Paris FC', pos: 'GK', ovr: 62, stats: { div: 61, han: 65, kic: 55, ref: 60, spd: 38, pos: 65 } }
    ]
  },
  {
    id: 'troyes',
    name: 'ES Troyes AC',
    logo: '🔵',
    squad: [
      { id: 'samassa', name: 'Mateo Bandiera', pos: 'GK', ovr: 71, stats: { div: 72, han: 70, kic: 62, ref: 77, spd: 40, pos: 68 } },
      { id: 'bandiera', name: 'Yasser Larouci', pos: 'LB', ovr: 71, stats: { pac: 71, sho: 45, pas: 73, dri: 71, def: 64, phy: 70 } },
      { id: 'larouci', name: 'Ryan Cissé', pos: 'CB', ovr: 71, stats: { pac: 57, sho: 42, pas: 62, dri: 60, def: 74, phy: 68 } },
      { id: 'cisse_r', name: 'Florian Tardieu', pos: 'CDM', ovr: 71, stats: { pac: 61, sho: 61, pas: 72, dri: 63, def: 72, phy: 76 } },
      { id: 'tardieu', name: 'Wilson Odobert Troyes', pos: 'RW', ovr: 72, stats: { pac: 84, sho: 67, pas: 73, dri: 84, def: 39, phy: 61 } },
      { id: 'odobert_w', name: 'Renaud Ripart', pos: 'CAM', ovr: 71, stats: { pac: 70, sho: 74, pas: 73, dri: 75, def: 45, phy: 66 } },
      { id: 'ripart', name: 'Tristan Dingomé', pos: 'CM', ovr: 71, stats: { pac: 61, sho: 64, pas: 75, dri: 73, def: 59, phy: 74 } },
      { id: 'dingome', name: 'Ryan Nazon', pos: 'ST', ovr: 72, stats: { pac: 81, sho: 79, pas: 68, dri: 70, def: 47, phy: 69 } },
      { id: 'nazon', name: 'Karim Yoda', pos: 'CM', ovr: 70, stats: { pac: 67, sho: 66, pas: 72, dri: 75, def: 58, phy: 62 } },
      { id: 'yoda', name: 'Adil Boulbina', pos: 'RW', ovr: 71, stats: { pac: 79, sho: 74, pas: 72, dri: 82, def: 39, phy: 66 } },
      { id: 'boulbina', name: 'Mama Baldé', pos: 'ST', ovr: 71, stats: { pac: 75, sho: 73, pas: 65, dri: 77, def: 40, phy: 68 } },
      { id: 'cisse_2', name: 'Erik Palmer-Brown', pos: 'CB', ovr: 70, stats: { pac: 59, sho: 37, pas: 61, dri: 56, def: 74, phy: 67 } },
      { id: 'samassa2', name: 'Anthony Mandrea', pos: 'GK', ovr: 62, stats: { div: 58, han: 59, kic: 56, ref: 66, spd: 33, pos: 60 } }
    ]
  },
  {
    id: 'le_mans',
    name: 'Le Mans FC',
    logo: '⚫🟡',
    squad: [
      { id: 'cornette', name: 'Théo Chaumont', pos: 'GK', ovr: 68, stats: { div: 69, han: 64, kic: 61, ref: 74, spd: 32, pos: 69 } },
      { id: 'chaumont', name: 'Mathis Picouleau', pos: 'CB', ovr: 68, stats: { pac: 63, sho: 41, pas: 63, dri: 57, def: 69, phy: 74 } },
      { id: 'picouleau', name: 'Thomas Robinet', pos: 'RB', ovr: 68, stats: { pac: 75, sho: 39, pas: 69, dri: 65, def: 61, phy: 57 } },
      { id: 'robinet', name: 'Anthony Boulos', pos: 'CDM', ovr: 68, stats: { pac: 62, sho: 56, pas: 62, dri: 62, def: 74, phy: 76 } },
      { id: 'boulos', name: 'Anthony Percin', pos: 'CM', ovr: 68, stats: { pac: 60, sho: 63, pas: 69, dri: 64, def: 56, phy: 65 } },
      { id: 'percin', name: 'Ewen Jaouen', pos: 'RW', ovr: 68, stats: { pac: 77, sho: 64, pas: 60, dri: 71, def: 31, phy: 54 } },
      { id: 'jaouen', name: 'Karim Aouadhi', pos: 'ST', ovr: 69, stats: { pac: 70, sho: 75, pas: 57, dri: 71, def: 38, phy: 71 } },
      { id: 'aouadhi', name: 'Alan Vieira', pos: 'LW', ovr: 68, stats: { pac: 76, sho: 71, pas: 64, dri: 70, def: 37, phy: 54 } },
      { id: 'vieira_a', name: 'Yannis Guichard', pos: 'CB', ovr: 67, stats: { pac: 55, sho: 32, pas: 61, dri: 59, def: 70, phy: 67 } },
      { id: 'guichard', name: 'Kevin Fortuné', pos: 'ST', ovr: 68, stats: { pac: 70, sho: 72, pas: 62, dri: 69, def: 34, phy: 68 } },
      { id: 'fortune', name: 'Lassana Faye', pos: 'CM', ovr: 67, stats: { pac: 62, sho: 53, pas: 75, dri: 70, def: 57, phy: 67 } },
      { id: 'picouleau2', name: 'Etienne Green', pos: 'GK', ovr: 61, stats: { div: 66, han: 59, kic: 52, ref: 61, spd: 38, pos: 63 } }
    ]
  },
  {
    id: 'inter_milan',
    name: 'Inter Milan',
    logo: '🔵⚫',
    squad: [
      { id: 'sommer', name: 'Yann Sommer', pos: 'GK', ovr: 84, stats: { div: 87, han: 87, kic: 72, ref: 85, spd: 43, pos: 87 } },
      { id: 'pavard', name: 'Benjamin Pavard', pos: 'RB', ovr: 81, stats: { pac: 84, sho: 59, pas: 75, dri: 84, def: 80, phy: 74 } },
      { id: 'acerbi', name: 'Francesco Acerbi', pos: 'CB', ovr: 81, stats: { pac: 69, sho: 46, pas: 78, dri: 71, def: 79, phy: 81 } },
      { id: 'bastoni', name: 'Alessandro Bastoni', pos: 'CB', ovr: 87, stats: { pac: 79, sho: 57, pas: 77, dri: 78, def: 89, phy: 89 } },
      { id: 'dimarco', name: 'Federico Dimarco', pos: 'LB', ovr: 85, stats: { pac: 92, sho: 63, pas: 81, dri: 81, def: 82, phy: 80 } },
      { id: 'barella', name: 'Nicolò Barella', pos: 'CM', ovr: 87, stats: { pac: 84, sho: 76, pas: 89, dri: 86, def: 77, phy: 90 } },
      { id: 'calhanoglu', name: 'Hakan Çalhanoğlu', pos: 'CDM', ovr: 86, stats: { pac: 76, sho: 69, pas: 82, dri: 84, def: 86, phy: 90 } },
      { id: 'mkhitaryan', name: 'Henrikh Mkhitaryan', pos: 'CM', ovr: 82, stats: { pac: 70, sho: 70, pas: 81, dri: 86, def: 70, phy: 77 } },
      { id: 'dumfries_i', name: 'Denzel Dumfries Inter', pos: 'RM', ovr: 83, stats: { pac: 72, sho: 72, pas: 90, dri: 86, def: 80, phy: 86 } },
      { id: 'thuram_m', name: 'Marcus Thuram', pos: 'ST', ovr: 86, stats: { pac: 90, sho: 95, pas: 73, dri: 93, def: 55, phy: 78 } },
      { id: 'lautaro', name: 'Lautaro Martínez', pos: 'ST', ovr: 88, stats: { pac: 94, sho: 95, pas: 79, dri: 85, def: 62, phy: 87 } },
      { id: 'carlos_augusto', name: 'Carlos Augusto', pos: 'LB', ovr: 78, stats: { pac: 81, sho: 60, pas: 68, dri: 71, def: 71, phy: 66 } },
      { id: 'martinez_j', name: 'Josep Martínez', pos: 'GK', ovr: 77, stats: { div: 80, han: 77, kic: 65, ref: 76, spd: 32, pos: 78 } },
      { id: 'de_vrij', name: 'Stefan de Vrij', pos: 'CB', ovr: 79, stats: { pac: 73, sho: 55, pas: 69, dri: 71, def: 82, phy: 80 } },
      { id: 'frattesi', name: 'Davide Frattesi', pos: 'CM', ovr: 81, stats: { pac: 72, sho: 70, pas: 91, dri: 87, def: 75, phy: 75 } },
      { id: 'taremi', name: 'Mehdi Taremi', pos: 'ST', ovr: 80, stats: { pac: 79, sho: 82, pas: 70, dri: 85, def: 45, phy: 76 } },
      { id: 'zielinski', name: 'Piotr Zieliński', pos: 'CAM', ovr: 79, stats: { pac: 77, sho: 71, pas: 84, dri: 88, def: 56, phy: 70 } }
    ]
  },
  {
    id: 'juventus',
    name: 'Juventus',
    logo: '⚪⚫',
    squad: [
      { id: 'di_gregorio', name: 'Michele Di Gregorio', pos: 'GK', ovr: 82, stats: { div: 87, han: 82, kic: 72, ref: 83, spd: 44, pos: 86 } },
      { id: 'kalulu', name: 'Pierre Kalulu', pos: 'RB', ovr: 78, stats: { pac: 85, sho: 55, pas: 70, dri: 72, def: 75, phy: 74 } },
      { id: 'bremer', name: 'Gleison Bremer', pos: 'CB', ovr: 85, stats: { pac: 71, sho: 59, pas: 80, dri: 71, def: 83, phy: 91 } },
      { id: 'kelly_l', name: 'Lloyd Kelly', pos: 'CB', ovr: 78, stats: { pac: 69, sho: 50, pas: 71, dri: 67, def: 81, phy: 86 } },
      { id: 'cambiaso', name: 'Andrea Cambiaso', pos: 'LB', ovr: 84, stats: { pac: 91, sho: 65, pas: 81, dri: 80, def: 81, phy: 75 } },
      { id: 'locatelli', name: 'Manuel Locatelli', pos: 'CDM', ovr: 82, stats: { pac: 77, sho: 72, pas: 83, dri: 80, def: 92, phy: 86 } },
      { id: 'thuram_k', name: 'Khéphren Thuram', pos: 'CM', ovr: 83, stats: { pac: 75, sho: 78, pas: 84, dri: 84, def: 71, phy: 85 } },
      { id: 'mckennie', name: 'Weston McKennie', pos: 'CM', ovr: 79, stats: { pac: 73, sho: 68, pas: 88, dri: 74, def: 76, phy: 80 } },
      { id: 'yildiz', name: 'Kenan Yıldız', pos: 'RW', ovr: 84, stats: { pac: 88, sho: 85, pas: 81, dri: 95, def: 53, phy: 73 } },
      { id: 'conceicao', name: 'Francisco Conceição', pos: 'LW', ovr: 79, stats: { pac: 92, sho: 72, pas: 78, dri: 80, def: 44, phy: 64 } },
      { id: 'vlahovic', name: 'Dušan Vlahović', pos: 'ST', ovr: 84, stats: { pac: 91, sho: 89, pas: 79, dri: 83, def: 57, phy: 82 } },
      { id: 'koopmeiners', name: 'Teun Koopmeiners', pos: 'CAM', ovr: 82, stats: { pac: 73, sho: 80, pas: 91, dri: 85, def: 60, phy: 71 } },
      { id: 'perin', name: 'Mattia Perin', pos: 'GK', ovr: 76, stats: { div: 76, han: 79, kic: 72, ref: 83, spd: 36, pos: 77 } },
      { id: 'gatti', name: 'Federico Gatti', pos: 'CB', ovr: 79, stats: { pac: 75, sho: 52, pas: 70, dri: 69, def: 82, phy: 86 } },
      { id: 'douglas_luiz', name: 'Douglas Luiz', pos: 'CM', ovr: 79, stats: { pac: 73, sho: 66, pas: 86, dri: 75, def: 73, phy: 72 } },
      { id: 'openda_j', name: 'Jonathan David Juve', pos: 'ST', ovr: 80, stats: { pac: 89, sho: 86, pas: 75, dri: 78, def: 52, phy: 75 } }
    ]
  },
  {
    id: 'ac_milan',
    name: 'AC Milan',
    logo: '🔴⚫',
    squad: [
      { id: 'maignan', name: 'Mike Maignan', pos: 'GK', ovr: 87, stats: { div: 85, han: 89, kic: 74, ref: 89, spd: 30, pos: 91 } },
      { id: 'calabria', name: 'Davide Calabria', pos: 'RB', ovr: 78, stats: { pac: 85, sho: 48, pas: 74, dri: 76, def: 79, phy: 75 } },
      { id: 'tomori', name: 'Fikayo Tomori', pos: 'CB', ovr: 82, stats: { pac: 72, sho: 57, pas: 70, dri: 64, def: 90, phy: 79 } },
      { id: 'gabbia', name: 'Matteo Gabbia', pos: 'CB', ovr: 79, stats: { pac: 67, sho: 49, pas: 69, dri: 61, def: 88, phy: 81 } },
      { id: 'theo_hernandez', name: 'Theo Hernández', pos: 'LB', ovr: 85, stats: { pac: 90, sho: 58, pas: 86, dri: 80, def: 88, phy: 80 } },
      { id: 'fofana_y_milan', name: 'Youssouf Fofana', pos: 'CDM', ovr: 81, stats: { pac: 77, sho: 70, pas: 81, dri: 75, def: 89, phy: 82 } },
      { id: 'modric', name: 'Luka Modrić', pos: 'CM', ovr: 84, stats: { pac: 73, sho: 81, pas: 92, dri: 86, def: 79, phy: 79 } },
      { id: 'rabiot', name: 'Adrien Rabiot', pos: 'CM', ovr: 82, stats: { pac: 76, sho: 78, pas: 92, dri: 87, def: 70, phy: 82 } },
      { id: 'pulisic', name: 'Christian Pulisic', pos: 'RW', ovr: 84, stats: { pac: 93, sho: 81, pas: 76, dri: 86, def: 52, phy: 74 } },
      { id: 'leao', name: 'Rafael Leão', pos: 'LW', ovr: 85, stats: { pac: 90, sho: 81, pas: 82, dri: 94, def: 54, phy: 71 } },
      { id: 'gimenez_s', name: 'Santiago Giménez', pos: 'ST', ovr: 80, stats: { pac: 88, sho: 84, pas: 78, dri: 88, def: 46, phy: 77 } },
      { id: 'joao_felix', name: 'João Félix', pos: 'CAM', ovr: 82, stats: { pac: 84, sho: 79, pas: 89, dri: 86, def: 52, phy: 70 } },
      { id: 'sportiello', name: 'Marco Sportiello', pos: 'GK', ovr: 74, stats: { div: 71, han: 71, kic: 67, ref: 77, spd: 44, pos: 76 } },
      { id: 'thiaw', name: 'Malick Thiaw', pos: 'CB', ovr: 79, stats: { pac: 69, sho: 54, pas: 73, dri: 66, def: 87, phy: 83 } },
      { id: 'loftus_cheek', name: 'Ruben Loftus-Cheek', pos: 'CM', ovr: 79, stats: { pac: 71, sho: 72, pas: 81, dri: 85, def: 68, phy: 83 } },
      { id: 'jovic', name: 'Luka Jović', pos: 'ST', ovr: 76, stats: { pac: 74, sho: 76, pas: 69, dri: 74, def: 46, phy: 67 } }
    ]
  },
  {
    id: 'napoli',
    name: 'SSC Napoli',
    logo: '🔵',
    squad: [
      { id: 'meret', name: 'Alex Meret', pos: 'GK', ovr: 82, stats: { div: 86, han: 83, kic: 76, ref: 88, spd: 45, pos: 84 } },
      { id: 'di_lorenzo', name: 'Giovanni Di Lorenzo', pos: 'RB', ovr: 84, stats: { pac: 89, sho: 54, pas: 75, dri: 81, def: 88, phy: 76 } },
      { id: 'rrahmani', name: 'Amir Rrahmani', pos: 'CB', ovr: 82, stats: { pac: 75, sho: 46, pas: 73, dri: 73, def: 87, phy: 88 } },
      { id: 'buongiorno', name: 'Alessandro Buongiorno', pos: 'CB', ovr: 83, stats: { pac: 69, sho: 49, pas: 71, dri: 73, def: 82, phy: 90 } },
      { id: 'spinazzola', name: 'Leonardo Spinazzola', pos: 'LB', ovr: 78, stats: { pac: 77, sho: 59, pas: 74, dri: 74, def: 82, phy: 71 } },
      { id: 'mctominay', name: 'Scott McTominay', pos: 'CM', ovr: 84, stats: { pac: 80, sho: 71, pas: 92, dri: 90, def: 71, phy: 85 } },
      { id: 'anguissa', name: 'Frank Anguissa', pos: 'CDM', ovr: 82, stats: { pac: 69, sho: 64, pas: 78, dri: 78, def: 91, phy: 90 } },
      { id: 'lobotka', name: 'Stanislav Lobotka', pos: 'CDM', ovr: 82, stats: { pac: 78, sho: 69, pas: 82, dri: 72, def: 89, phy: 85 } },
      { id: 'politano', name: 'Matteo Politano', pos: 'RW', ovr: 80, stats: { pac: 86, sho: 83, pas: 73, dri: 82, def: 44, phy: 66 } },
      { id: 'neres', name: 'David Neres', pos: 'LW', ovr: 81, stats: { pac: 90, sho: 83, pas: 73, dri: 87, def: 50, phy: 72 } },
      { id: 'lukaku', name: 'Romelu Lukaku', pos: 'ST', ovr: 83, stats: { pac: 85, sho: 90, pas: 69, dri: 80, def: 52, phy: 76 } },
      { id: 'hojlund_n', name: 'Rasmus Højlund Napoli', pos: 'ST', ovr: 79, stats: { pac: 85, sho: 82, pas: 75, dri: 78, def: 44, phy: 75 } },
      { id: 'contini', name: 'Nikita Contini', pos: 'GK', ovr: 68, stats: { div: 68, han: 65, kic: 63, ref: 67, spd: 40, pos: 71 } },
      { id: 'juanlu', name: 'Juan Jesus', pos: 'CB', ovr: 77, stats: { pac: 68, sho: 47, pas: 74, dri: 64, def: 77, phy: 74 } },
      { id: 'gilmour_b', name: 'Billy Gilmour Napoli', pos: 'CM', ovr: 78, stats: { pac: 67, sho: 68, pas: 77, dri: 80, def: 69, phy: 74 } },
      { id: 'lang_n', name: 'Noa Lang', pos: 'LW', ovr: 78, stats: { pac: 86, sho: 81, pas: 71, dri: 80, def: 44, phy: 66 } }
    ]
  },
  {
    id: 'roma',
    name: 'AS Roma',
    logo: '🟠🔴',
    squad: [
      { id: 'svilar', name: 'Mile Svilar', pos: 'GK', ovr: 82, stats: { div: 87, han: 83, kic: 73, ref: 81, spd: 30, pos: 78 } },
      { id: 'celik', name: 'Zeki Çelik', pos: 'RB', ovr: 78, stats: { pac: 84, sho: 56, pas: 70, dri: 78, def: 71, phy: 72 } },
      { id: 'ndicka', name: 'Evan Ndicka', pos: 'CB', ovr: 82, stats: { pac: 72, sho: 47, pas: 77, dri: 71, def: 86, phy: 80 } },
      { id: 'mancini_g', name: 'Gianluca Mancini', pos: 'CB', ovr: 80, stats: { pac: 74, sho: 49, pas: 74, dri: 61, def: 89, phy: 76 } },
      { id: 'angelino', name: 'Angeliño', pos: 'LB', ovr: 79, stats: { pac: 78, sho: 54, pas: 71, dri: 72, def: 79, phy: 79 } },
      { id: 'cristante', name: 'Bryan Cristante', pos: 'CDM', ovr: 79, stats: { pac: 67, sho: 62, pas: 79, dri: 70, def: 82, phy: 83 } },
      { id: 'koné_m', name: 'Manu Koné', pos: 'CM', ovr: 80, stats: { pac: 73, sho: 68, pas: 79, dri: 81, def: 78, phy: 83 } },
      { id: 'el_shaarawy', name: 'Stephan El Shaarawy', pos: 'LW', ovr: 76, stats: { pac: 79, sho: 74, pas: 72, dri: 78, def: 46, phy: 66 } },
      { id: 'soulé', name: 'Matías Soulé', pos: 'RW', ovr: 81, stats: { pac: 93, sho: 77, pas: 82, dri: 91, def: 49, phy: 67 } },
      { id: 'pellegrini_l', name: 'Lorenzo Pellegrini', pos: 'CAM', ovr: 81, stats: { pac: 77, sho: 75, pas: 89, dri: 89, def: 58, phy: 79 } },
      { id: 'dovbyk', name: 'Artem Dovbyk', pos: 'ST', ovr: 81, stats: { pac: 79, sho: 90, pas: 77, dri: 78, def: 49, phy: 72 } },
      { id: 'dybala', name: 'Paulo Dybala', pos: 'CAM', ovr: 83, stats: { pac: 80, sho: 84, pas: 87, dri: 91, def: 57, phy: 78 } },
      { id: 'gollini', name: 'Pierluigi Gollini', pos: 'GK', ovr: 73, stats: { div: 72, han: 77, kic: 64, ref: 70, spd: 30, pos: 75 } },
      { id: 'hermoso', name: 'Mario Hermoso', pos: 'CB', ovr: 78, stats: { pac: 74, sho: 50, pas: 66, dri: 68, def: 85, phy: 75 } },
      { id: 'wesley_f', name: 'Wesley França', pos: 'RB', ovr: 76, stats: { pac: 77, sho: 54, pas: 66, dri: 69, def: 72, phy: 74 } },
      { id: 'bailey_r', name: 'Leon Bailey Roma', pos: 'RW', ovr: 79, stats: { pac: 93, sho: 75, pas: 80, dri: 88, def: 51, phy: 70 } }
    ]
  },
  {
    id: 'atalanta',
    name: 'Atalanta BC',
    logo: '🔵⚫',
    squad: [
      { id: 'carnesecchi', name: 'Marco Carnesecchi', pos: 'GK', ovr: 82, stats: { div: 88, han: 82, kic: 78, ref: 85, spd: 32, pos: 82 } },
      { id: 'djimsiti', name: 'Berat Djimsiti', pos: 'CB', ovr: 78, stats: { pac: 70, sho: 46, pas: 68, dri: 64, def: 83, phy: 77 } },
      { id: 'hien', name: 'Isak Hien', pos: 'CB', ovr: 79, stats: { pac: 68, sho: 49, pas: 71, dri: 64, def: 85, phy: 77 } },
      { id: 'kolasinac', name: 'Sead Kolašinac', pos: 'LB', ovr: 76, stats: { pac: 78, sho: 49, pas: 75, dri: 76, def: 77, phy: 70 } },
      { id: 'zappacosta', name: 'Davide Zappacosta', pos: 'RB', ovr: 78, stats: { pac: 77, sho: 59, pas: 74, dri: 75, def: 73, phy: 71 } },
      { id: 'ederson_a', name: 'Éderson', pos: 'CDM', ovr: 82, stats: { pac: 75, sho: 72, pas: 80, dri: 79, def: 83, phy: 83 } },
      { id: 'de_roon', name: 'Marten de Roon', pos: 'CM', ovr: 78, stats: { pac: 70, sho: 68, pas: 80, dri: 81, def: 73, phy: 72 } },
      { id: 'sulemana', name: 'Kamaldeen Sulemana', pos: 'LW', ovr: 78, stats: { pac: 83, sho: 79, pas: 76, dri: 86, def: 48, phy: 70 } },
      { id: 'lookman', name: 'Ademola Lookman', pos: 'RW', ovr: 85, stats: { pac: 90, sho: 78, pas: 79, dri: 85, def: 59, phy: 75 } },
      { id: 'brescianini', name: 'Marco Brescianini', pos: 'CM', ovr: 77, stats: { pac: 73, sho: 75, pas: 85, dri: 74, def: 67, phy: 70 } },
      { id: 'krstovic', name: 'Nikola Krstović', pos: 'ST', ovr: 79, stats: { pac: 86, sho: 88, pas: 71, dri: 79, def: 46, phy: 75 } },
      { id: 'retegui_scam', name: 'Charles De Ketelaere', pos: 'CAM', ovr: 83, stats: { pac: 82, sho: 86, pas: 93, dri: 93, def: 58, phy: 74 } },
      { id: 'rui_patricio', name: 'Rui Patrício', pos: 'GK', ovr: 76, stats: { div: 75, han: 80, kic: 65, ref: 75, spd: 33, pos: 80 } },
      { id: 'scalvini', name: 'Giorgio Scalvini', pos: 'CB', ovr: 80, stats: { pac: 76, sho: 48, pas: 76, dri: 71, def: 83, phy: 78 } },
      { id: 'pasalic', name: 'Mario Pašalić', pos: 'CM', ovr: 78, stats: { pac: 75, sho: 68, pas: 77, dri: 83, def: 69, phy: 75 } },
      { id: 'maldini_d', name: 'Daniel Maldini', pos: 'CAM', ovr: 76, stats: { pac: 73, sho: 71, pas: 76, dri: 81, def: 51, phy: 62 } }
    ]
  },
  {
    id: 'bologna',
    name: 'Bologna FC',
    logo: '🔴⚔️',
    squad: [
      { id: 'skorupski', name: 'Łukasz Skorupski', pos: 'GK', ovr: 79, stats: { div: 79, han: 81, kic: 69, ref: 83, spd: 39, pos: 76 } },
      { id: 'holm_e', name: 'Emil Holm', pos: 'RB', ovr: 76, stats: { pac: 72, sho: 54, pas: 73, dri: 72, def: 70, phy: 74 } },
      { id: 'beukema', name: 'Sam Beukema', pos: 'CB', ovr: 79, stats: { pac: 76, sho: 46, pas: 72, dri: 66, def: 81, phy: 75 } },
      { id: 'lucumi', name: 'Jhon Lucumí', pos: 'CB', ovr: 78, stats: { pac: 68, sho: 50, pas: 71, dri: 64, def: 77, phy: 77 } },
      { id: 'lykogiannis', name: 'Dimitrios Lykogiannis', pos: 'LB', ovr: 76, stats: { pac: 76, sho: 51, pas: 70, dri: 79, def: 69, phy: 76 } },
      { id: 'freuler', name: 'Remo Freuler', pos: 'CDM', ovr: 79, stats: { pac: 66, sho: 69, pas: 74, dri: 74, def: 82, phy: 75 } },
      { id: 'ferguson_l', name: 'Lewis Ferguson', pos: 'CM', ovr: 78, stats: { pac: 76, sho: 74, pas: 79, dri: 81, def: 70, phy: 82 } },
      { id: 'moro', name: 'Nikola Moro', pos: 'CM', ovr: 76, stats: { pac: 65, sho: 67, pas: 77, dri: 77, def: 71, phy: 78 } },
      { id: 'orsolini', name: 'Riccardo Orsolini', pos: 'RW', ovr: 80, stats: { pac: 89, sho: 77, pas: 80, dri: 81, def: 45, phy: 73 } },
      { id: 'ndoye', name: 'Dan Ndoye', pos: 'LW', ovr: 79, stats: { pac: 86, sho: 83, pas: 70, dri: 85, def: 44, phy: 63 } },
      { id: 'castro_s', name: 'Santiago Castro', pos: 'ST', ovr: 78, stats: { pac: 76, sho: 79, pas: 68, dri: 79, def: 48, phy: 71 } },
      { id: 'odgaard', name: 'Thijs Dallinga Bologna', pos: 'ST', ovr: 75, stats: { pac: 80, sho: 81, pas: 73, dri: 73, def: 45, phy: 71 } },
      { id: 'ravaglia', name: 'Federico Ravaglia', pos: 'GK', ovr: 71, stats: { div: 71, han: 74, kic: 60, ref: 77, spd: 35, pos: 69 } },
      { id: 'casale', name: 'Nicolò Casale', pos: 'CB', ovr: 75, stats: { pac: 68, sho: 46, pas: 64, dri: 56, def: 84, phy: 75 } },
      { id: 'fabbian', name: 'Giovanni Fabbian', pos: 'CM', ovr: 77, stats: { pac: 66, sho: 71, pas: 81, dri: 75, def: 67, phy: 79 } },
      { id: 'dallinga_b', name: 'Jesper Karlsson', pos: 'RW', ovr: 76, stats: { pac: 82, sho: 73, pas: 77, dri: 80, def: 43, phy: 62 } }
    ]
  },
  {
    id: 'fiorentina',
    name: 'ACF Fiorentina',
    logo: '🟣',
    squad: [
      { id: 'de_gea', name: 'David de Gea', pos: 'GK', ovr: 84, stats: { div: 87, han: 85, kic: 75, ref: 85, spd: 33, pos: 87 } },
      { id: 'dodo', name: 'Dodô', pos: 'RB', ovr: 80, stats: { pac: 81, sho: 60, pas: 74, dri: 81, def: 72, phy: 71 } },
      { id: 'ranieri_l', name: 'Luca Ranieri', pos: 'CB', ovr: 77, stats: { pac: 75, sho: 49, pas: 71, dri: 63, def: 81, phy: 75 } },
      { id: 'pongracic', name: 'Marin Pongračić', pos: 'CB', ovr: 76, stats: { pac: 64, sho: 48, pas: 70, dri: 59, def: 82, phy: 74 } },
      { id: 'gosens_p', name: 'Robin Gosens Fiorentina', pos: 'LB', ovr: 78, stats: { pac: 81, sho: 50, pas: 74, dri: 74, def: 77, phy: 68 } },
      { id: 'mandragora', name: 'Rolando Mandragora', pos: 'CDM', ovr: 78, stats: { pac: 68, sho: 65, pas: 72, dri: 70, def: 84, phy: 81 } },
      { id: 'fagioli', name: 'Nicolò Fagioli', pos: 'CM', ovr: 78, stats: { pac: 73, sho: 73, pas: 83, dri: 75, def: 69, phy: 80 } },
      { id: 'gudmundsson_a2', name: 'Albert Guðmundsson', pos: 'CAM', ovr: 79, stats: { pac: 76, sho: 80, pas: 83, dri: 84, def: 61, phy: 75 } },
      { id: 'zaniolo', name: 'Nicolò Zaniolo', pos: 'RW', ovr: 76, stats: { pac: 86, sho: 69, pas: 73, dri: 76, def: 49, phy: 72 } },
      { id: 'kean', name: 'Moise Kean', pos: 'ST', ovr: 81, stats: { pac: 87, sho: 84, pas: 77, dri: 79, def: 55, phy: 77 } },
      { id: 'gudmundsson', name: 'Edin Džeko', pos: 'ST', ovr: 79, stats: { pac: 76, sho: 90, pas: 70, dri: 85, def: 51, phy: 75 } },
      { id: 'sottil', name: 'Riccardo Sottil', pos: 'LW', ovr: 74, stats: { pac: 86, sho: 68, pas: 75, dri: 78, def: 36, phy: 62 } },
      { id: 'martinelli_f', name: 'Tommaso Martinelli', pos: 'GK', ovr: 68, stats: { div: 65, han: 63, kic: 61, ref: 66, spd: 32, pos: 66 } },
      { id: 'comuzzo', name: 'Pietro Comuzzo', pos: 'CB', ovr: 76, stats: { pac: 65, sho: 51, pas: 73, dri: 66, def: 86, phy: 77 } },
      { id: 'folorunsho', name: 'Michael Folorunsho', pos: 'CM', ovr: 75, stats: { pac: 73, sho: 64, pas: 84, dri: 79, def: 70, phy: 70 } },
      { id: 'colpani', name: 'Andrea Colpani', pos: 'CAM', ovr: 77, stats: { pac: 68, sho: 80, pas: 84, dri: 84, def: 57, phy: 65 } }
    ]
  },
  {
    id: 'lazio',
    name: 'SS Lazio',
    logo: '🔵⚪',
    squad: [
      { id: 'provedel', name: 'Ivan Provedel', pos: 'GK', ovr: 79, stats: { div: 82, han: 78, kic: 74, ref: 81, spd: 32, pos: 84 } },
      { id: 'marusic', name: 'Adam Marušić', pos: 'RB', ovr: 77, stats: { pac: 76, sho: 56, pas: 77, dri: 72, def: 77, phy: 70 } },
      { id: 'romagnoli_a', name: 'Alessio Romagnoli', pos: 'CB', ovr: 79, stats: { pac: 68, sho: 46, pas: 76, dri: 63, def: 83, phy: 81 } },
      { id: 'gila', name: 'Mario Gila', pos: 'CB', ovr: 78, stats: { pac: 64, sho: 51, pas: 73, dri: 69, def: 80, phy: 77 } },
      { id: 'tavares_n', name: 'Nuno Tavares', pos: 'LB', ovr: 78, stats: { pac: 78, sho: 57, pas: 76, dri: 75, def: 76, phy: 68 } },
      { id: 'rovella', name: 'Nicolò Rovella', pos: 'CDM', ovr: 79, stats: { pac: 74, sho: 65, pas: 77, dri: 76, def: 79, phy: 84 } },
      { id: 'guendouzi', name: 'Matteo Guendouzi', pos: 'CM', ovr: 80, stats: { pac: 72, sho: 76, pas: 79, dri: 77, def: 74, phy: 78 } },
      { id: 'dele_bashiru', name: 'Dele-Bashiru', pos: 'CM', ovr: 75, stats: { pac: 68, sho: 68, pas: 76, dri: 74, def: 61, phy: 77 } },
      { id: 'zaccagni', name: 'Mattia Zaccagni', pos: 'LW', ovr: 81, stats: { pac: 86, sho: 83, pas: 78, dri: 88, def: 51, phy: 67 } },
      { id: 'isaksen', name: 'Gustav Isaksen', pos: 'RW', ovr: 78, stats: { pac: 89, sho: 74, pas: 78, dri: 87, def: 48, phy: 72 } },
      { id: 'castellanos', name: 'Valentín Castellanos', pos: 'ST', ovr: 79, stats: { pac: 81, sho: 87, pas: 76, dri: 77, def: 44, phy: 74 } },
      { id: 'noslin_t', name: 'Tijjani Noslin', pos: 'ST', ovr: 74, stats: { pac: 77, sho: 76, pas: 63, dri: 80, def: 43, phy: 66 } },
      { id: 'mandas', name: 'Christos Mandas', pos: 'GK', ovr: 74, stats: { div: 72, han: 74, kic: 63, ref: 76, spd: 38, pos: 73 } },
      { id: 'pellegrini_g', name: 'Luca Pellegrini', pos: 'LB', ovr: 74, stats: { pac: 76, sho: 54, pas: 64, dri: 77, def: 68, phy: 62 } },
      { id: 'cataldi', name: 'Danilo Cataldi', pos: 'CM', ovr: 75, stats: { pac: 72, sho: 68, pas: 79, dri: 72, def: 70, phy: 71 } },
      { id: 'dia_b', name: 'Boulaye Dia', pos: 'ST', ovr: 78, stats: { pac: 84, sho: 81, pas: 71, dri: 82, def: 46, phy: 74 } }
    ]
  },
  {
    id: 'torino',
    name: 'Torino FC',
    logo: '🐂',
    squad: [
      { id: 'milinkovic_savic', name: 'Vanja Milinković-Savić', pos: 'GK', ovr: 79, stats: { div: 76, han: 79, kic: 73, ref: 78, spd: 38, pos: 81 } },
      { id: 'pedersen_v', name: 'Valentino Lazaro', pos: 'RB', ovr: 75, stats: { pac: 72, sho: 55, pas: 75, dri: 68, def: 70, phy: 64 } },
      { id: 'masina', name: 'Adam Masina', pos: 'CB', ovr: 75, stats: { pac: 64, sho: 40, pas: 67, dri: 58, def: 77, phy: 77 } },
      { id: 'coco_saul', name: 'Saul Coco Torino', pos: 'CB', ovr: 76, stats: { pac: 66, sho: 49, pas: 71, dri: 57, def: 77, phy: 72 } },
      { id: 'sosa', name: 'Nikola Vlašić', pos: 'CAM', ovr: 77, stats: { pac: 71, sho: 70, pas: 85, dri: 86, def: 59, phy: 66 } },
      { id: 'ricci_s', name: 'Samuele Ricci', pos: 'CM', ovr: 78, stats: { pac: 66, sho: 73, pas: 81, dri: 83, def: 69, phy: 74 } },
      { id: 'linetty', name: 'Karol Linetty', pos: 'CDM', ovr: 74, stats: { pac: 59, sho: 65, pas: 72, dri: 67, def: 77, phy: 79 } },
      { id: 'lazaro', name: 'Ché Adams', pos: 'ST', ovr: 77, stats: { pac: 84, sho: 83, pas: 65, dri: 78, def: 52, phy: 72 } },
      { id: 'vojvoda', name: 'Mërgim Vojvoda', pos: 'RB', ovr: 74, stats: { pac: 78, sho: 51, pas: 70, dri: 73, def: 69, phy: 69 } },
      { id: 'sanabria', name: 'Antonio Sanabria', pos: 'ST', ovr: 75, stats: { pac: 82, sho: 76, pas: 65, dri: 82, def: 51, phy: 65 } },
      { id: 'vlasic', name: 'Nikola Vlašić II', pos: 'CAM', ovr: 76, stats: { pac: 74, sho: 76, pas: 86, dri: 82, def: 48, phy: 66 } },
      { id: 'adams_c', name: 'Yann Karamoh', pos: 'LW', ovr: 75, stats: { pac: 86, sho: 76, pas: 67, dri: 83, def: 45, phy: 67 } },
      { id: 'paleari', name: 'Alberto Paleari', pos: 'GK', ovr: 68, stats: { div: 64, han: 66, kic: 58, ref: 71, spd: 34, pos: 64 } },
      { id: 'walukiewicz', name: 'Jakub Walukiewicz', pos: 'CB', ovr: 74, stats: { pac: 68, sho: 41, pas: 69, dri: 58, def: 79, phy: 80 } },
      { id: 'ilic_i', name: 'Ivan Ilić Torino', pos: 'CM', ovr: 76, stats: { pac: 65, sho: 71, pas: 75, dri: 81, def: 62, phy: 77 } }
    ]
  },
  {
    id: 'udinese',
    name: 'Udinese Calcio',
    logo: '⚫⚪',
    squad: [
      { id: 'okoye', name: 'Maduka Okoye', pos: 'GK', ovr: 76, stats: { div: 76, han: 72, kic: 67, ref: 78, spd: 36, pos: 72 } },
      { id: 'kabasele', name: 'Christian Kabasele', pos: 'CB', ovr: 74, stats: { pac: 66, sho: 42, pas: 72, dri: 59, def: 77, phy: 73 } },
      { id: 'bijol', name: 'Jaka Bijol', pos: 'CB', ovr: 78, stats: { pac: 76, sho: 46, pas: 72, dri: 68, def: 81, phy: 83 } },
      { id: 'ehizibue', name: 'Kingsley Ehizibue', pos: 'RB', ovr: 74, stats: { pac: 73, sho: 45, pas: 65, dri: 71, def: 76, phy: 64 } },
      { id: 'kristensen_r', name: 'Rasmus Kristensen Udinese', pos: 'RB', ovr: 74, stats: { pac: 75, sho: 53, pas: 67, dri: 68, def: 72, phy: 67 } },
      { id: 'lovric', name: 'Sandi Lovrić', pos: 'CM', ovr: 77, stats: { pac: 76, sho: 74, pas: 78, dri: 78, def: 68, phy: 69 } },
      { id: 'karlstrom', name: 'Jesper Karlström', pos: 'CDM', ovr: 74, stats: { pac: 63, sho: 65, pas: 70, dri: 69, def: 81, phy: 71 } },
      { id: 'atta', name: 'Christian Atta', pos: 'RW', ovr: 74, stats: { pac: 87, sho: 67, pas: 68, dri: 83, def: 36, phy: 63 } },
      { id: 'davis', name: 'Keinan Davis', pos: 'ST', ovr: 74, stats: { pac: 73, sho: 80, pas: 60, dri: 72, def: 41, phy: 65 } },
      { id: 'thauvin', name: 'Florian Thauvin', pos: 'RW', ovr: 78, stats: { pac: 81, sho: 72, pas: 74, dri: 80, def: 50, phy: 67 } },
      { id: 'lucca', name: 'Lorenzo Lucca', pos: 'ST', ovr: 77, stats: { pac: 77, sho: 80, pas: 73, dri: 74, def: 50, phy: 68 } },
      { id: 'zemura', name: 'Jamie Zemura', pos: 'LB', ovr: 73, stats: { pac: 80, sho: 48, pas: 70, dri: 75, def: 66, phy: 62 } },
      { id: 'padelli', name: 'Simone Scuffet', pos: 'GK', ovr: 68, stats: { div: 71, han: 68, kic: 62, ref: 68, spd: 37, pos: 65 } },
      { id: 'bravo', name: 'Nehuén Pérez', pos: 'CB', ovr: 75, stats: { pac: 66, sho: 42, pas: 68, dri: 59, def: 76, phy: 79 } },
      { id: 'ekkelenkamp', name: 'Oliver Ekkelenkamp', pos: 'CM', ovr: 75, stats: { pac: 64, sho: 71, pas: 79, dri: 72, def: 62, phy: 73 } }
    ]
  },
  {
    id: 'genoa',
    name: 'Genoa CFC',
    logo: '🔴⚔️',
    squad: [
      { id: 'leali', name: 'Nicola Leali', pos: 'GK', ovr: 74, stats: { div: 75, han: 75, kic: 65, ref: 75, spd: 43, pos: 72 } },
      { id: 'vasquez_j', name: 'Johan Vásquez', pos: 'CB', ovr: 76, stats: { pac: 74, sho: 51, pas: 74, dri: 67, def: 77, phy: 82 } },
      { id: 'de_winter', name: 'Koni De Winter', pos: 'CB', ovr: 76, stats: { pac: 69, sho: 42, pas: 74, dri: 64, def: 84, phy: 79 } },
      { id: 'sabelli', name: 'Stefano Sabelli', pos: 'RB', ovr: 73, stats: { pac: 70, sho: 53, pas: 65, dri: 68, def: 72, phy: 63 } },
      { id: 'martin_a', name: 'Aaron Martín', pos: 'LB', ovr: 74, stats: { pac: 76, sho: 53, pas: 65, dri: 74, def: 67, phy: 68 } },
      { id: 'frendrup', name: 'Morten Frendrup', pos: 'CDM', ovr: 76, stats: { pac: 68, sho: 64, pas: 69, dri: 66, def: 86, phy: 77 } },
      { id: 'badelj', name: 'Milan Badelj', pos: 'CM', ovr: 74, stats: { pac: 67, sho: 64, pas: 80, dri: 77, def: 68, phy: 71 } },
      { id: 'miretti', name: 'Fabio Miretti', pos: 'CM', ovr: 75, stats: { pac: 70, sho: 67, pas: 75, dri: 80, def: 73, phy: 76 } },
      { id: 'zanoli', name: 'Alessandro Zanoli', pos: 'RB', ovr: 73, stats: { pac: 81, sho: 49, pas: 73, dri: 68, def: 74, phy: 70 } },
      { id: 'ekuban', name: 'Caleb Ekuban', pos: 'ST', ovr: 73, stats: { pac: 81, sho: 83, pas: 70, dri: 72, def: 46, phy: 69 } },
      { id: 'colombo_l', name: 'Lorenzo Colombo', pos: 'ST', ovr: 75, stats: { pac: 76, sho: 79, pas: 71, dri: 81, def: 49, phy: 73 } },
      { id: 'vitinha_g', name: 'Vitinha Genoa', pos: 'ST', ovr: 76, stats: { pac: 75, sho: 78, pas: 69, dri: 75, def: 44, phy: 67 } },
      { id: 'gollini_g', name: 'Sebastiano Desplanches', pos: 'GK', ovr: 65, stats: { div: 63, han: 66, kic: 54, ref: 70, spd: 34, pos: 68 } },
      { id: 'bani', name: 'Mattia Bani', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 41, pas: 65, dri: 54, def: 77, phy: 75 } },
      { id: 'malinovskyi', name: 'Ruslan Malinovskyi', pos: 'CAM', ovr: 75, stats: { pac: 65, sho: 77, pas: 80, dri: 75, def: 57, phy: 64 } }
    ]
  },
  {
    id: 'cagliari',
    name: 'Cagliari Calcio',
    logo: '🔴🔵',
    squad: [
      { id: 'sherri', name: 'Elia Caprile', pos: 'GK', ovr: 76, stats: { div: 75, han: 70, kic: 64, ref: 80, spd: 38, pos: 76 } },
      { id: 'zappa', name: 'Gabriele Zappa', pos: 'RB', ovr: 74, stats: { pac: 73, sho: 47, pas: 76, dri: 70, def: 78, phy: 73 } },
      { id: 'luperto', name: 'Sebastiano Luperto', pos: 'CB', ovr: 75, stats: { pac: 62, sho: 49, pas: 61, dri: 64, def: 83, phy: 79 } },
      { id: 'mina', name: 'Yerry Mina', pos: 'CB', ovr: 77, stats: { pac: 70, sho: 51, pas: 65, dri: 63, def: 78, phy: 78 } },
      { id: 'augello', name: 'Alberto Dossena', pos: 'LB', ovr: 73, stats: { pac: 71, sho: 51, pas: 70, dri: 74, def: 73, phy: 68 } },
      { id: 'adopo', name: 'Michel Adopo', pos: 'CDM', ovr: 74, stats: { pac: 69, sho: 64, pas: 73, dri: 66, def: 83, phy: 74 } },
      { id: 'makoumbou', name: 'Nadir Zortea', pos: 'RB', ovr: 73, stats: { pac: 70, sho: 47, pas: 71, dri: 76, def: 73, phy: 69 } },
      { id: 'deiola', name: 'Alessandro Deiola', pos: 'CM', ovr: 74, stats: { pac: 73, sho: 69, pas: 77, dri: 74, def: 69, phy: 70 } },
      { id: 'luvumbo', name: 'Zito Luvumbo', pos: 'RW', ovr: 76, stats: { pac: 79, sho: 75, pas: 76, dri: 79, def: 46, phy: 71 } },
      { id: 'piccoli', name: 'Roberto Piccoli', pos: 'ST', ovr: 76, stats: { pac: 75, sho: 78, pas: 68, dri: 76, def: 51, phy: 78 } },
      { id: 'felici', name: 'Gennaro Borrelli', pos: 'ST', ovr: 74, stats: { pac: 76, sho: 84, pas: 68, dri: 72, def: 50, phy: 66 } },
      { id: 'viola_g', name: 'Gianluca Gaetano', pos: 'CAM', ovr: 75, stats: { pac: 66, sho: 72, pas: 75, dri: 81, def: 50, phy: 72 } },
      { id: 'scuffet_c', name: 'Simone Scuffet Cagliari', pos: 'GK', ovr: 68, stats: { div: 68, han: 70, kic: 63, ref: 71, spd: 33, pos: 66 } },
      { id: 'obert_j', name: 'Jakub Obert', pos: 'CB', ovr: 72, stats: { pac: 64, sho: 41, pas: 66, dri: 58, def: 74, phy: 75 } },
      { id: 'prati_m', name: 'Michael Folorunsho Cagliari', pos: 'CM', ovr: 73, stats: { pac: 73, sho: 61, pas: 75, dri: 67, def: 60, phy: 66 } }
    ]
  },
  {
    id: 'parma',
    name: 'Parma Calcio',
    logo: '🟡🔵',
    squad: [
      { id: 'suzuki', name: 'Zion Suzuki', pos: 'GK', ovr: 76, stats: { div: 76, han: 78, kic: 70, ref: 83, spd: 42, pos: 77 } },
      { id: 'valeri', name: 'Woyo Coulibaly', pos: 'RB', ovr: 73, stats: { pac: 76, sho: 43, pas: 68, dri: 68, def: 72, phy: 62 } },
      { id: 'circati', name: 'Botond Balogh', pos: 'CB', ovr: 74, stats: { pac: 67, sho: 43, pas: 66, dri: 59, def: 73, phy: 79 } },
      { id: 'balogh', name: 'Giovanni Leoni', pos: 'CB', ovr: 76, stats: { pac: 72, sho: 47, pas: 63, dri: 63, def: 84, phy: 84 } },
      { id: 'valenti', name: 'Emanuele Valeri', pos: 'LB', ovr: 73, stats: { pac: 78, sho: 44, pas: 74, dri: 73, def: 68, phy: 72 } },
      { id: 'bernabe', name: 'Adrián Bernabé', pos: 'CAM', ovr: 77, stats: { pac: 77, sho: 80, pas: 80, dri: 84, def: 52, phy: 67 } },
      { id: 'sohm', name: 'Simon Sohm', pos: 'CM', ovr: 75, stats: { pac: 72, sho: 68, pas: 77, dri: 76, def: 72, phy: 74 } },
      { id: 'keita_m', name: 'Mandela Keita', pos: 'CDM', ovr: 73, stats: { pac: 68, sho: 60, pas: 77, dri: 61, def: 77, phy: 76 } },
      { id: 'man_d', name: 'Dennis Man', pos: 'RW', ovr: 77, stats: { pac: 88, sho: 81, pas: 74, dri: 83, def: 47, phy: 67 } },
      { id: 'cancellieri', name: 'Matteo Cancellieri', pos: 'LW', ovr: 74, stats: { pac: 84, sho: 77, pas: 64, dri: 78, def: 47, phy: 59 } },
      { id: 'bonny_a', name: 'Ange-Yoan Bonny', pos: 'ST', ovr: 75, stats: { pac: 81, sho: 75, pas: 69, dri: 81, def: 42, phy: 70 } },
      { id: 'pellegrino_l2', name: 'Lautaro Pellegrino', pos: 'ST', ovr: 73, stats: { pac: 73, sho: 81, pas: 65, dri: 76, def: 41, phy: 70 } },
      { id: 'corvi', name: 'Edoardo Corvi', pos: 'GK', ovr: 65, stats: { div: 71, han: 67, kic: 62, ref: 64, spd: 37, pos: 64 } },
      { id: 'coulibaly_w', name: 'Almoez Ali', pos: 'ST', ovr: 73, stats: { pac: 74, sho: 83, pas: 61, dri: 76, def: 46, phy: 74 } },
      { id: 'estevez_e', name: 'Enrico Del Prato', pos: 'RB', ovr: 71, stats: { pac: 67, sho: 44, pas: 67, dri: 74, def: 65, phy: 69 } }
    ]
  },
  {
    id: 'lecce',
    name: 'US Lecce',
    logo: '🟡🔴',
    squad: [
      { id: 'falcone', name: 'Wladimiro Falcone', pos: 'GK', ovr: 76, stats: { div: 76, han: 75, kic: 72, ref: 74, spd: 34, pos: 73 } },
      { id: 'gaspar_a', name: 'Antonino Gallo', pos: 'LB', ovr: 73, stats: { pac: 71, sho: 47, pas: 71, dri: 72, def: 66, phy: 71 } },
      { id: 'baschirotto', name: 'Federico Baschirotto', pos: 'CB', ovr: 75, stats: { pac: 67, sho: 41, pas: 71, dri: 65, def: 76, phy: 82 } },
      { id: 'jean', name: 'Marin Pongračić Lecce', pos: 'CB', ovr: 74, stats: { pac: 70, sho: 41, pas: 60, dri: 64, def: 82, phy: 71 } },
      { id: 'gonzalez_i', name: 'Ylber Ramadani', pos: 'CDM', ovr: 75, stats: { pac: 68, sho: 64, pas: 75, dri: 73, def: 85, phy: 75 } },
      { id: 'coulibaly_l', name: 'Lassana Coulibaly', pos: 'CM', ovr: 73, stats: { pac: 71, sho: 70, pas: 75, dri: 75, def: 67, phy: 75 } },
      { id: 'helgason', name: 'Hjörtur Hermannsson', pos: 'RB', ovr: 72, stats: { pac: 75, sho: 45, pas: 65, dri: 71, def: 66, phy: 70 } },
      { id: 'krstovic_l', name: 'Nikola Krstović Lecce', pos: 'ST', ovr: 76, stats: { pac: 84, sho: 79, pas: 70, dri: 80, def: 41, phy: 75 } },
      { id: 'pierotti_e', name: 'Ante Rebić', pos: 'LW', ovr: 74, stats: { pac: 85, sho: 70, pas: 65, dri: 77, def: 45, phy: 64 } },
      { id: 'rebic', name: 'Lameck Banda', pos: 'RW', ovr: 74, stats: { pac: 86, sho: 68, pas: 65, dri: 78, def: 47, phy: 60 } },
      { id: 'camarda_f', name: 'Francesco Camarda', pos: 'ST', ovr: 73, stats: { pac: 71, sho: 82, pas: 60, dri: 77, def: 38, phy: 66 } },
      { id: 'ramadani', name: 'Medon Berisha', pos: 'CM', ovr: 71, stats: { pac: 67, sho: 67, pas: 74, dri: 70, def: 57, phy: 67 } },
      { id: 'fruchtl', name: 'Christian Früchtl', pos: 'GK', ovr: 66, stats: { div: 64, han: 68, kic: 60, ref: 71, spd: 38, pos: 68 } },
      { id: 'gallo_a', name: 'Antonino Gallo II', pos: 'LB', ovr: 71, stats: { pac: 69, sho: 46, pas: 65, dri: 66, def: 72, phy: 62 } },
      { id: 'pierret', name: 'Lucas Pierotti', pos: 'CAM', ovr: 71, stats: { pac: 65, sho: 66, pas: 81, dri: 79, def: 47, phy: 62 } }
    ]
  },
  {
    id: 'sassuolo',
    name: 'US Sassuolo',
    logo: '🟢⚫',
    squad: [
      { id: 'muric_a', name: 'Alessio Cragno', pos: 'GK', ovr: 74, stats: { div: 79, han: 77, kic: 65, ref: 77, spd: 43, pos: 72 } },
      { id: 'doig', name: 'Josh Doig', pos: 'LB', ovr: 74, stats: { pac: 73, sho: 45, pas: 70, dri: 75, def: 68, phy: 67 } },
      { id: 'idzes', name: 'Jamie Idzes', pos: 'CB', ovr: 74, stats: { pac: 72, sho: 44, pas: 65, dri: 64, def: 83, phy: 75 } },
      { id: 'romagna_m', name: 'Michele Rabbi', pos: 'CB', ovr: 73, stats: { pac: 60, sho: 45, pas: 68, dri: 64, def: 79, phy: 73 } },
      { id: 'toljan', name: 'Jonathan Toljan', pos: 'RB', ovr: 73, stats: { pac: 75, sho: 46, pas: 68, dri: 71, def: 76, phy: 72 } },
      { id: 'boloca', name: 'Kristian Thorstvedt', pos: 'CM', ovr: 75, stats: { pac: 74, sho: 67, pas: 85, dri: 71, def: 72, phy: 75 } },
      { id: 'matheus_henrique', name: 'Matheus Henrique', pos: 'CDM', ovr: 74, stats: { pac: 68, sho: 59, pas: 78, dri: 62, def: 82, phy: 80 } },
      { id: 'thorstvedt', name: 'Armand Laurienté', pos: 'LW', ovr: 76, stats: { pac: 82, sho: 78, pas: 69, dri: 85, def: 44, phy: 65 } },
      { id: 'laurente', name: 'Domenico Berardi', pos: 'RW', ovr: 79, stats: { pac: 83, sho: 81, pas: 78, dri: 80, def: 53, phy: 66 } },
      { id: 'pinamonti', name: 'Andrea Pinamonti', pos: 'ST', ovr: 76, stats: { pac: 78, sho: 81, pas: 69, dri: 83, def: 51, phy: 74 } },
      { id: 'volpato', name: 'Cesare Casadei', pos: 'CM', ovr: 75, stats: { pac: 67, sho: 62, pas: 74, dri: 75, def: 68, phy: 72 } },
      { id: 'berardi', name: 'Fabio Ferro', pos: 'ST', ovr: 71, stats: { pac: 80, sho: 76, pas: 61, dri: 72, def: 37, phy: 72 } },
      { id: 'consigli', name: 'Andrea Consigli', pos: 'GK', ovr: 71, stats: { div: 73, han: 70, kic: 62, ref: 71, spd: 34, pos: 71 } },
      { id: 'pieragnolo_f', name: 'Filippo Pieragnolo', pos: 'LB', ovr: 70, stats: { pac: 71, sho: 52, pas: 67, dri: 64, def: 63, phy: 60 } },
      { id: 'casadei_c', name: 'Georgios Vagiannidis', pos: 'RB', ovr: 71, stats: { pac: 71, sho: 50, pas: 72, dri: 66, def: 72, phy: 64 } }
    ]
  },
  {
    id: 'venezia',
    name: 'Venezia FC',
    logo: '🟠⚫',
    squad: [
      { id: 'joronen', name: 'Jesse Joronen', pos: 'GK', ovr: 73, stats: { div: 74, han: 72, kic: 60, ref: 71, spd: 40, pos: 75 } },
      { id: 'svoboda', name: 'Filip Stankovič', pos: 'GK', ovr: 68, stats: { div: 68, han: 71, kic: 63, ref: 68, spd: 30, pos: 69 } },
      { id: 'sverko_i', name: 'Ivan Sverko', pos: 'CB', ovr: 72, stats: { pac: 66, sho: 39, pas: 59, dri: 58, def: 70, phy: 77 } },
      { id: 'idzes_i', name: 'Idrissa Touré', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 44, pas: 66, dri: 66, def: 65, phy: 61 } },
      { id: 'haps', name: 'Jay Idzes', pos: 'CB', ovr: 73, stats: { pac: 69, sho: 42, pas: 68, dri: 57, def: 81, phy: 76 } },
      { id: 'duncan_a', name: 'Alfred Duncan', pos: 'CM', ovr: 73, stats: { pac: 69, sho: 64, pas: 78, dri: 69, def: 71, phy: 73 } },
      { id: 'busio', name: 'Gianluca Busio', pos: 'CM', ovr: 74, stats: { pac: 68, sho: 68, pas: 73, dri: 72, def: 63, phy: 76 } },
      { id: 'doumbia_g', name: 'Gaetano Oristanio', pos: 'CAM', ovr: 74, stats: { pac: 64, sho: 71, pas: 84, dri: 83, def: 53, phy: 64 } },
      { id: 'yeboah_g', name: 'Gift Orban', pos: 'ST', ovr: 74, stats: { pac: 74, sho: 82, pas: 64, dri: 79, def: 42, phy: 73 } },
      { id: 'nicolussi_c', name: 'Christian Nicolussi Caviglia', pos: 'CM', ovr: 71, stats: { pac: 66, sho: 67, pas: 81, dri: 70, def: 69, phy: 63 } },
      { id: 'candela_j', name: 'Jacopo Fazzini', pos: 'RW', ovr: 73, stats: { pac: 86, sho: 65, pas: 70, dri: 78, def: 44, phy: 61 } },
      { id: 'crnigoj', name: 'David Okereke', pos: 'ST', ovr: 73, stats: { pac: 72, sho: 82, pas: 66, dri: 78, def: 43, phy: 63 } },
      { id: 'grandi', name: 'Filippo Grandi', pos: 'GK', ovr: 65, stats: { div: 69, han: 61, kic: 57, ref: 62, spd: 33, pos: 67 } },
      { id: 'sagrado_p', name: 'Diego Sagrado', pos: 'RB', ovr: 70, stats: { pac: 75, sho: 48, pas: 65, dri: 71, def: 70, phy: 60 } },
      { id: 'ellertsson', name: 'Fisnik Asllani Venezia', pos: 'CAM', ovr: 71, stats: { pac: 67, sho: 70, pas: 80, dri: 73, def: 45, phy: 61 } }
    ]
  },
  {
    id: 'frosinone',
    name: 'Frosinone Calcio',
    logo: '🟡🔵',
    squad: [
      { id: 'cerofolini', name: 'Stefano Turati', pos: 'GK', ovr: 73, stats: { div: 70, han: 70, kic: 67, ref: 76, spd: 32, pos: 75 } },
      { id: 'monterisi', name: 'Giuseppe Marchizza', pos: 'LB', ovr: 71, stats: { pac: 68, sho: 50, pas: 63, dri: 64, def: 66, phy: 65 } },
      { id: 'okoli', name: 'Alessio Okoli', pos: 'CB', ovr: 72, stats: { pac: 61, sho: 47, pas: 69, dri: 55, def: 79, phy: 76 } },
      { id: 'bettella', name: 'Marco Bettella', pos: 'CB', ovr: 72, stats: { pac: 65, sho: 39, pas: 69, dri: 63, def: 70, phy: 72 } },
      { id: 'marchizza', name: 'Riccardo Marchizza', pos: 'RB', ovr: 71, stats: { pac: 71, sho: 43, pas: 66, dri: 74, def: 63, phy: 69 } },
      { id: 'brescianini_f', name: 'Enrico Del Prato Frosinone', pos: 'CDM', ovr: 71, stats: { pac: 59, sho: 51, pas: 74, dri: 62, def: 72, phy: 68 } },
      { id: 'barcs', name: 'Barnabás Varga', pos: 'ST', ovr: 73, stats: { pac: 74, sho: 74, pas: 61, dri: 72, def: 44, phy: 68 } },
      { id: 'soule_f', name: 'Ibrahima Cissé', pos: 'CM', ovr: 71, stats: { pac: 63, sho: 63, pas: 78, dri: 74, def: 61, phy: 74 } },
      { id: 'cheddira', name: 'Walid Cheddira', pos: 'ST', ovr: 73, stats: { pac: 79, sho: 80, pas: 65, dri: 73, def: 39, phy: 74 } },
      { id: 'reinier', name: 'Reinier', pos: 'CAM', ovr: 74, stats: { pac: 71, sho: 67, pas: 85, dri: 85, def: 44, phy: 68 } },
      { id: 'kvernadze', name: 'Zuriko Davitashvili', pos: 'RW', ovr: 73, stats: { pac: 78, sho: 71, pas: 73, dri: 77, def: 41, phy: 65 } },
      { id: 'varga', name: 'Ellery Balcombe Frosinone', pos: 'GK', ovr: 63, stats: { div: 61, han: 63, kic: 54, ref: 70, spd: 32, pos: 65 } },
      { id: 'garritano', name: 'Matteo Garritano', pos: 'LW', ovr: 71, stats: { pac: 73, sho: 66, pas: 62, dri: 73, def: 39, phy: 57 } }
    ]
  },
  {
    id: 'monza',
    name: 'AC Monza',
    logo: '🔴⚪',
    squad: [
      { id: 'turati', name: 'Stefano Turati Monza', pos: 'GK', ovr: 71, stats: { div: 75, han: 66, kic: 64, ref: 77, spd: 31, pos: 68 } },
      { id: 'pedro_pereira', name: 'Pedro Pereira', pos: 'RB', ovr: 71, stats: { pac: 76, sho: 47, pas: 72, dri: 67, def: 68, phy: 70 } },
      { id: 'caldirola', name: 'Luca Caldirola', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 49, pas: 70, dri: 55, def: 78, phy: 80 } },
      { id: 'izzo', name: 'Armando Izzo', pos: 'CB', ovr: 73, stats: { pac: 60, sho: 47, pas: 68, dri: 62, def: 78, phy: 70 } },
      { id: 'kyriakopoulos', name: 'Georgios Kyriakopoulos', pos: 'LB', ovr: 71, stats: { pac: 79, sho: 42, pas: 70, dri: 72, def: 67, phy: 67 } },
      { id: 'pessina_m', name: 'Matteo Pessina', pos: 'CM', ovr: 75, stats: { pac: 68, sho: 70, pas: 74, dri: 80, def: 66, phy: 77 } },
      { id: 'bianco', name: 'Samuele Birindelli', pos: 'RB', ovr: 70, stats: { pac: 72, sho: 50, pas: 64, dri: 69, def: 62, phy: 64 } },
      { id: 'mota_c', name: 'Dany Mota', pos: 'ST', ovr: 74, stats: { pac: 72, sho: 84, pas: 68, dri: 75, def: 50, phy: 75 } },
      { id: 'colpani_a', name: 'Andrea Colpani Monza', pos: 'CAM', ovr: 74, stats: { pac: 75, sho: 67, pas: 82, dri: 83, def: 51, phy: 60 } },
      { id: 'maldini', name: 'Daniel Maldini Monza', pos: 'CAM', ovr: 73, stats: { pac: 74, sho: 70, pas: 80, dri: 83, def: 46, phy: 59 } },
      { id: 'djuric', name: 'Milan Đurić', pos: 'ST', ovr: 73, stats: { pac: 81, sho: 76, pas: 59, dri: 71, def: 49, phy: 72 } },
      { id: 'gagliardini_r', name: 'Roberto Gagliardini', pos: 'CM', ovr: 73, stats: { pac: 64, sho: 61, pas: 82, dri: 75, def: 66, phy: 67 } },
      { id: 'sorrentino_s', name: 'Stefano Sorrentino Jr', pos: 'GK', ovr: 62, stats: { div: 62, han: 65, kic: 49, ref: 63, spd: 30, pos: 67 } }
    ]
  },
  {
    id: 'pakhtakor',
    name: 'Pakhtakor Tashkent',
    logo: '⚪🟢',
    squad: [
      { id: 'sergeev_a', name: 'Aleksandr Sergeev', pos: 'GK', ovr: 78, stats: { div: 78, han: 76, kic: 68, ref: 80, spd: 40, pos: 78 } },
      { id: 'krotov_v', name: 'Vladimir Krotov', pos: 'RB', ovr: 74, stats: { pac: 76, sho: 55, pas: 70, dri: 68, def: 74, phy: 71 } },
      { id: 'abdullaev_o', name: 'Ozodbek Abdullaev', pos: 'CB', ovr: 75, stats: { pac: 68, sho: 40, pas: 66, dri: 60, def: 78, phy: 79 } },
      { id: 'kutin_v', name: 'Vitaliy Kutin', pos: 'CB', ovr: 73, stats: { pac: 65, sho: 38, pas: 64, dri: 58, def: 76, phy: 77 } },
      { id: 'tuychiev_t', name: 'Temurbek Tuychiev', pos: 'LB', ovr: 74, stats: { pac: 78, sho: 52, pas: 71, dri: 72, def: 73, phy: 68 } },
      { id: 'rashidov_s', name: 'Sardor Rashidov', pos: 'CM', ovr: 79, stats: { pac: 74, sho: 74, pas: 80, dri: 81, def: 62, phy: 68 }, altPos: ['CAM'] },
      { id: 'tanoev_i', name: 'Islom Tanoev', pos: 'CDM', ovr: 75, stats: { pac: 66, sho: 58, pas: 74, dri: 70, def: 78, phy: 75 } },
      { id: 'xolmurzaev_d', name: 'Diyor Xolmurzaev', pos: 'CAM', ovr: 77, stats: { pac: 75, sho: 76, pas: 78, dri: 82, def: 45, phy: 60 }, altPos: ['RW'] },
      { id: 'sayfiev_f', name: 'Farrukh Sayfiev', pos: 'RW', ovr: 76, stats: { pac: 87, sho: 71, pas: 73, dri: 80, def: 32, phy: 58 } },
      { id: 'tishaev_e', name: "Elyor Tishaev", pos: 'LW', ovr: 74, stats: { pac: 84, sho: 68, pas: 70, dri: 78, def: 30, phy: 56 } },
      { id: 'shukurov_o', name: 'Otabek Shukurov', pos: 'ST', ovr: 78, stats: { pac: 80, sho: 79, pas: 66, dri: 76, def: 34, phy: 74 } },

      { id: 'baymatov_s', name: 'Sardor Baymatov', pos: 'GK', ovr: 68, stats: { div: 66, han: 65, kic: 55, ref: 70, spd: 34, pos: 68 } },
      { id: 'tuychiboev_j', name: 'Jasur Yakhshiboev', pos: 'RM', ovr: 73, stats: { pac: 82, sho: 65, pas: 69, dri: 76, def: 32, phy: 60 } },
      { id: 'erkinov_a', name: 'Anvar Berdiev', pos: 'CB', ovr: 71, stats: { pac: 62, sho: 36, pas: 62, dri: 55, def: 74, phy: 75 } },
      { id: 'nishonov_b', name: 'Bekzod Nishonov', pos: 'CM', ovr: 72, stats: { pac: 68, sho: 63, pas: 74, dri: 72, def: 61, phy: 65 } },
      { id: 'gadoev_j', name: 'Jaloliddin Gadoev', pos: 'RB', ovr: 70, stats: { pac: 73, sho: 44, pas: 65, dri: 64, def: 69, phy: 66 } },
      { id: 'ergashev_m', name: 'Muzaffar Ergashev', pos: 'ST', ovr: 70, stats: { pac: 76, sho: 72, pas: 58, dri: 70, def: 30, phy: 68 } },
      { id: 'rustamov_j', name: 'Jasurbek Rustamov', pos: 'LB', ovr: 69, stats: { pac: 71, sho: 41, pas: 63, dri: 65, def: 68, phy: 64 } },
      { id: 'nematov_d', name: 'Doniyor Nematov', pos: 'CDM', ovr: 70, stats: { pac: 62, sho: 50, pas: 68, dri: 63, def: 72, phy: 71 } }
    ]
  },
  {
    id: 'nasaf',
    name: 'Nasaf Qarshi',
    logo: '🟢⚪',
    squad: [
      { id: 'nesterov_r', name: 'Rustam Nesterov', pos: 'GK', ovr: 74, stats: { div: 74, han: 72, kic: 64, ref: 76, spd: 36, pos: 74 } },
      { id: 'turaev_j', name: 'Jamshid Turaev', pos: 'RB', ovr: 72, stats: { pac: 74, sho: 48, pas: 68, dri: 66, def: 72, phy: 69 } },
      { id: 'irismetov_m', name: 'Murod Irismetov', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 37, pas: 63, dri: 56, def: 76, phy: 77 } },
      { id: 'khoshimov_b', name: 'Bobur Xoshimov', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 36, pas: 62, dri: 55, def: 75, phy: 75 } },
      { id: 'toshev_a', name: 'Aziz Toshev', pos: 'LB', ovr: 71, stats: { pac: 75, sho: 46, pas: 67, dri: 68, def: 70, phy: 65 } },
      { id: 'juraev_s', name: 'Sherzod Juraev', pos: 'CDM', ovr: 74, stats: { pac: 64, sho: 56, pas: 73, dri: 68, def: 77, phy: 74 } },
      { id: 'shodmonov_b', name: 'Bekzod Shodmonov', pos: 'CM', ovr: 75, stats: { pac: 71, sho: 68, pas: 78, dri: 76, def: 63, phy: 67 }, altPos: ['CAM'] },
      { id: 'kamolov_o', name: 'Otabek Kamolov', pos: 'CAM', ovr: 74, stats: { pac: 72, sho: 72, pas: 76, dri: 79, def: 42, phy: 58 } },
      { id: 'saidov_i', name: 'Ilkhom Saidov', pos: 'RW', ovr: 73, stats: { pac: 85, sho: 67, pas: 70, dri: 77, def: 30, phy: 56 } },
      { id: 'rakhmatov_a', name: 'Azizbek Rakhmatov', pos: 'LW', ovr: 72, stats: { pac: 83, sho: 66, pas: 68, dri: 75, def: 28, phy: 55 } },
      { id: 'juraboev_s', name: 'Sardor Juraboev', pos: 'ST', ovr: 75, stats: { pac: 79, sho: 76, pas: 63, dri: 74, def: 33, phy: 72 } },

      { id: 'ashurov_f', name: 'Farrukh Ashurov', pos: 'GK', ovr: 66, stats: { div: 64, han: 63, kic: 54, ref: 67, spd: 32, pos: 66 } },
      { id: 'yusupov_d', name: 'Diyorbek Yusupov', pos: 'RB', ovr: 68, stats: { pac: 71, sho: 42, pas: 62, dri: 63, def: 67, phy: 64 } },
      { id: 'nazarov_e', name: 'Elbek Nazarov', pos: 'CB', ovr: 69, stats: { pac: 60, sho: 34, pas: 60, dri: 53, def: 72, phy: 73 } },
      { id: 'karimov_j', name: 'Javlon Karimov', pos: 'CM', ovr: 70, stats: { pac: 66, sho: 61, pas: 72, dri: 70, def: 60, phy: 63 } },
      { id: 'mardonov_u', name: 'Ulugbek Mardonov', pos: 'LB', ovr: 68, stats: { pac: 72, sho: 40, pas: 61, dri: 64, def: 66, phy: 62 } },
      { id: 'gaffarov_r', name: 'Rustam G\u02bboffarov', pos: 'ST', ovr: 69, stats: { pac: 74, sho: 70, pas: 57, dri: 69, def: 28, phy: 67 } },
      { id: 'xasanov_b', name: 'Bekzod Xasanov', pos: 'CDM', ovr: 68, stats: { pac: 60, sho: 48, pas: 66, dri: 60, def: 71, phy: 70 } }
    ]
  },
  {
    id: 'bunyodkor',
    name: 'Bunyodkor',
    logo: '🟡⚫',
    squad: [
      { id: 'juraev_p', name: 'Pavel Juraev', pos: 'GK', ovr: 75, stats: { div: 75, han: 73, kic: 65, ref: 77, spd: 37, pos: 75 } },
      { id: 'ahmedov_a', name: 'Anzur Ahmedov', pos: 'RB', ovr: 73, stats: { pac: 75, sho: 49, pas: 69, dri: 67, def: 73, phy: 70 } },
      { id: 'shomurodov_z', name: 'Zoir Shomurodov', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 38, pas: 64, dri: 57, def: 77, phy: 78 } },
      { id: 'toirov_m', name: 'Mirjalol Toirov', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 37, pas: 63, dri: 56, def: 76, phy: 76 } },
      { id: 'ganiev_s', name: 'Sanjar Ganiev', pos: 'LB', ovr: 72, stats: { pac: 76, sho: 47, pas: 68, dri: 69, def: 71, phy: 66 } },
      { id: 'akhmedov_a', name: 'Alisher Akhmedov', pos: 'CDM', ovr: 75, stats: { pac: 65, sho: 57, pas: 75, dri: 69, def: 78, phy: 75 } },
      { id: 'masharipov_j', name: 'Jaloliddin Masharipov', pos: 'CAM', ovr: 80, stats: { pac: 76, sho: 78, pas: 82, dri: 84, def: 44, phy: 61 }, altPos: ['CM'] },
      { id: 'kholmatov_s', name: 'Sirojiddin Xolmatov', pos: 'CM', ovr: 76, stats: { pac: 72, sho: 69, pas: 79, dri: 77, def: 64, phy: 68 } },
      { id: 'fayzullaev_a', name: 'Abbosbek Fayzullaev', pos: 'RW', ovr: 79, stats: { pac: 84, sho: 77, pas: 80, dri: 85, def: 34, phy: 59 }, altPos: ['CAM'] },
      { id: 'abduxolikov_m', name: "Maxsud Abduxolikov", pos: 'LW', ovr: 74, stats: { pac: 85, sho: 68, pas: 69, dri: 78, def: 29, phy: 57 } },
      { id: 'akramov_j', name: 'Jasur Akramov', pos: 'ST', ovr: 76, stats: { pac: 81, sho: 77, pas: 64, dri: 75, def: 32, phy: 73 } },

      { id: 'yuldashev_r', name: 'Rustam Yuldashev', pos: 'GK', ovr: 67, stats: { div: 65, han: 64, kic: 55, ref: 68, spd: 33, pos: 67 } },
      { id: 'komilov_a', name: 'Akmal Komilov', pos: 'RB', ovr: 69, stats: { pac: 72, sho: 43, pas: 63, dri: 64, def: 68, phy: 64 } },
      { id: 'sobirov_j', name: 'Jamshid Sobirov', pos: 'CB', ovr: 70, stats: { pac: 61, sho: 35, pas: 61, dri: 54, def: 73, phy: 74 } },
      { id: 'raximov_b', name: 'Bobur Raximov', pos: 'CM', ovr: 71, stats: { pac: 67, sho: 62, pas: 73, dri: 71, def: 61, phy: 64 } },
      { id: 'urunov_s', name: 'Sherzod Urunov', pos: 'LB', ovr: 69, stats: { pac: 73, sho: 41, pas: 62, dri: 65, def: 67, phy: 63 } },
      { id: 'ibragimov_d', name: 'Doston Ibragimov', pos: 'ST', ovr: 71, stats: { pac: 77, sho: 73, pas: 59, dri: 71, def: 29, phy: 69 } },
      { id: 'norqulov_a', name: 'Anvar Norqulov', pos: 'RW', ovr: 70, stats: { pac: 80, sho: 62, pas: 65, dri: 74, def: 27, phy: 55 } }
    ]
  },
  {
    id: 'neftchi',
    name: 'Neftchi Farg\u02bbona',
    logo: '🔵🟡',
    squad: [
      { id: 'sultonov_i', name: 'Ilyos Sultonov', pos: 'GK', ovr: 73, stats: { div: 73, han: 71, kic: 63, ref: 75, spd: 35, pos: 73 } },
      { id: 'rajabov_o', name: 'Otabek Rajabov', pos: 'RB', ovr: 71, stats: { pac: 74, sho: 46, pas: 66, dri: 65, def: 71, phy: 68 } },
      { id: 'yusupov_i', name: 'Islom Yusupov', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 36, pas: 62, dri: 55, def: 75, phy: 76 } },
      { id: 'nematjonov_r', name: 'Rustam Nematjonov', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 35, pas: 61, dri: 54, def: 74, phy: 75 } },
      { id: 'boltaev_f', name: 'Fozil Boltaev', pos: 'LB', ovr: 70, stats: { pac: 74, sho: 44, pas: 65, dri: 66, def: 69, phy: 64 } },
      { id: 'mirzaev_a', name: 'Asror Mirzaev', pos: 'CDM', ovr: 73, stats: { pac: 63, sho: 55, pas: 72, dri: 67, def: 76, phy: 73 } },
      { id: 'saidkarimov_e', name: 'Elyorbek Saidkarimov', pos: 'CM', ovr: 74, stats: { pac: 70, sho: 67, pas: 77, dri: 75, def: 62, phy: 65 } },
      { id: 'nuraliev_j', name: 'Jaxongir Nuraliev', pos: 'CAM', ovr: 73, stats: { pac: 71, sho: 71, pas: 75, dri: 78, def: 41, phy: 57 } },
      { id: 'muminov_s', name: 'Sardorbek Muminov', pos: 'RW', ovr: 72, stats: { pac: 84, sho: 65, pas: 68, dri: 76, def: 29, phy: 55 } },
      { id: 'yuldashev_j', name: 'Javohir Yuldashev', pos: 'LW', ovr: 71, stats: { pac: 82, sho: 64, pas: 67, dri: 74, def: 28, phy: 54 } },
      { id: 'shodiev_b', name: 'Bexruz Shodiev', pos: 'ST', ovr: 74, stats: { pac: 78, sho: 75, pas: 62, dri: 73, def: 31, phy: 71 } },

      { id: 'tojiev_m', name: 'Mansur Tojiev', pos: 'GK', ovr: 65, stats: { div: 63, han: 62, kic: 53, ref: 66, spd: 31, pos: 65 } },
      { id: 'zokirov_a', name: 'Aziz Zokirov', pos: 'CB', ovr: 68, stats: { pac: 60, sho: 34, pas: 60, dri: 53, def: 71, phy: 72 } },
      { id: 'inomov_s', name: 'Sherali Inomov', pos: 'RB', ovr: 67, stats: { pac: 71, sho: 41, pas: 61, dri: 62, def: 66, phy: 63 } },
      { id: 'olimov_d', name: 'Dilshod Olimov', pos: 'CM', ovr: 69, stats: { pac: 65, sho: 60, pas: 71, dri: 69, def: 59, phy: 62 } },
      { id: 'hakimov_n', name: 'Nodirbek Hakimov', pos: 'ST', ovr: 68, stats: { pac: 75, sho: 69, pas: 56, dri: 68, def: 27, phy: 65 } },
      { id: 'ravshanov_q', name: 'Qodirjon Ravshanov', pos: 'LB', ovr: 67, stats: { pac: 72, sho: 39, pas: 60, dri: 63, def: 65, phy: 61 } }
    ]
  },
  {
    id: 'navbahor',
    name: 'Navbahor Namangan',
    logo: '🟢🔴',
    squad: [
      { id: 'abdiev_s', name: 'Sherzod Abdiev', pos: 'GK', ovr: 73, stats: { div: 73, han: 71, kic: 62, ref: 75, spd: 34, pos: 73 } },
      { id: 'ganiev_o', name: 'Otabek Ganiev', pos: 'RB', ovr: 71, stats: { pac: 73, sho: 45, pas: 66, dri: 64, def: 70, phy: 67 } },
      { id: 'juraboev_m', name: 'Mirodil Juraboev', pos: 'CB', ovr: 72, stats: { pac: 61, sho: 35, pas: 61, dri: 54, def: 75, phy: 76 } },
      { id: 'norqobilov_j', name: 'Jasurbek Norqobilov', pos: 'CB', ovr: 71, stats: { pac: 60, sho: 34, pas: 60, dri: 53, def: 74, phy: 74 } },
      { id: 'ismoilov_b', name: 'Behruz Ismoilov', pos: 'LB', ovr: 70, stats: { pac: 74, sho: 43, pas: 64, dri: 65, def: 68, phy: 63 } },
      { id: 'kholiqov_a', name: 'Anvarjon Xoliqov', pos: 'CDM', ovr: 72, stats: { pac: 62, sho: 54, pas: 71, dri: 66, def: 75, phy: 72 } },
      { id: 'mirzaev_n', name: 'Nodir Mirzaev', pos: 'CM', ovr: 73, stats: { pac: 69, sho: 66, pas: 76, dri: 74, def: 61, phy: 64 } },
      { id: 'sultonov_j', name: 'Jamoliddin Sultonov', pos: 'CAM', ovr: 72, stats: { pac: 70, sho: 70, pas: 74, dri: 77, def: 40, phy: 56 } },
      { id: 'rakhimov_f', name: 'Farrux Raximov', pos: 'RW', ovr: 71, stats: { pac: 83, sho: 64, pas: 67, dri: 75, def: 28, phy: 54 } },
      { id: 'temirov_i', name: 'Ikrom Temirov', pos: 'LW', ovr: 70, stats: { pac: 81, sho: 63, pas: 66, dri: 73, def: 27, phy: 53 } },
      { id: 'jalilov_b', name: 'Bexruzbek Jalilov', pos: 'ST', ovr: 73, stats: { pac: 77, sho: 74, pas: 61, dri: 72, def: 30, phy: 70 } },

      { id: 'nurmatov_a', name: 'Abdulla Nurmatov', pos: 'GK', ovr: 64, stats: { div: 62, han: 61, kic: 52, ref: 65, spd: 30, pos: 64 } },
      { id: 'egamberdiev_x', name: 'Xurshid Egamberdiev', pos: 'CB', ovr: 67, stats: { pac: 59, sho: 33, pas: 59, dri: 52, def: 70, phy: 71 } },
      { id: 'tojiboev_s', name: 'Sanjarbek Tojiboev', pos: 'RB', ovr: 66, stats: { pac: 70, sho: 40, pas: 60, dri: 61, def: 65, phy: 62 } },
      { id: 'qodirov_e', name: 'Eldor Qodirov', pos: 'CM', ovr: 68, stats: { pac: 64, sho: 59, pas: 70, dri: 68, def: 58, phy: 61 } },
      { id: 'sharipov_j', name: 'Javoxir Sharipov', pos: 'ST', ovr: 67, stats: { pac: 74, sho: 68, pas: 55, dri: 67, def: 26, phy: 64 } }
    ]
  },
  {
    id: 'andijon',
    name: 'Andijon FK',
    logo: '🔴⚪',
    squad: [
      { id: 'yusupov_r', name: 'Ravshan Yusupov', pos: 'GK', ovr: 71, stats: { div: 71, han: 69, kic: 60, ref: 73, spd: 33, pos: 71 } },
      { id: 'davronov_b', name: 'Bekzod Davronov', pos: 'RB', ovr: 70, stats: { pac: 72, sho: 44, pas: 65, dri: 63, def: 69, phy: 66 } },
      { id: 'yormatov_s', name: 'Shoxrux Yormatov', pos: 'CB', ovr: 71, stats: { pac: 60, sho: 34, pas: 60, dri: 53, def: 74, phy: 75 } },
      { id: 'abdurahimov_n', name: 'Nurbek Abdurahimov', pos: 'CB', ovr: 70, stats: { pac: 59, sho: 33, pas: 59, dri: 52, def: 73, phy: 73 } },
      { id: 'tojimatov_i', name: 'Ilxom Tojimatov', pos: 'LB', ovr: 69, stats: { pac: 73, sho: 42, pas: 63, dri: 64, def: 67, phy: 62 } },
      { id: 'yoqubov_d', name: 'Doniyor Yoqubov', pos: 'CDM', ovr: 71, stats: { pac: 61, sho: 53, pas: 70, dri: 65, def: 74, phy: 71 } },
      { id: 'nazarov_a', name: 'Alisher Nazarov', pos: 'CM', ovr: 72, stats: { pac: 68, sho: 65, pas: 75, dri: 73, def: 60, phy: 63 } },
      { id: 'raxmonov_u', name: 'Ulug\u02bbbek Raxmonov', pos: 'CAM', ovr: 71, stats: { pac: 69, sho: 69, pas: 73, dri: 76, def: 39, phy: 55 } },
      { id: 'ochilov_j', name: 'Jasur Ochilov', pos: 'RW', ovr: 70, stats: { pac: 82, sho: 63, pas: 66, dri: 74, def: 27, phy: 53 } },
      { id: 'mamatov_b', name: 'Botir Mamatov', pos: 'LW', ovr: 69, stats: { pac: 80, sho: 62, pas: 65, dri: 72, def: 26, phy: 52 } },
      { id: 'usmonov_s', name: 'Sardor Usmonov', pos: 'ST', ovr: 72, stats: { pac: 76, sho: 73, pas: 60, dri: 71, def: 29, phy: 69 } },

      { id: 'boborayimov_x', name: 'Xasan Boborayimov', pos: 'GK', ovr: 63, stats: { div: 61, han: 60, kic: 51, ref: 64, spd: 29, pos: 63 } },
      { id: 'shodmonov_j', name: 'Jaxongir Shodmonov', pos: 'CB', ovr: 66, stats: { pac: 58, sho: 32, pas: 58, dri: 51, def: 69, phy: 70 } },
      { id: 'ergashov_t', name: 'Temur Ergashov', pos: 'RB', ovr: 65, stats: { pac: 69, sho: 39, pas: 59, dri: 60, def: 64, phy: 61 } },
      { id: 'nazirov_a', name: 'Abror Nazirov', pos: 'CM', ovr: 67, stats: { pac: 63, sho: 58, pas: 69, dri: 67, def: 57, phy: 60 } },
      { id: 'olimjonov_r', name: 'Rustam Olimjonov', pos: 'ST', ovr: 66, stats: { pac: 73, sho: 67, pas: 54, dri: 66, def: 25, phy: 63 } }
    ]
  },
  {
    id: 'agmk',
    name: 'AGMK Olmaliq',
    logo: '🔵⚪',
    squad: [
      { id: 'norchaev_j', name: 'Jasur Norchaev', pos: 'GK', ovr: 72, stats: { div: 72, han: 70, kic: 61, ref: 74, spd: 34, pos: 72 } },
      { id: 'boymurodov_a', name: 'Ayubxon Boymurodov', pos: 'RB', ovr: 71, stats: { pac: 73, sho: 45, pas: 66, dri: 64, def: 70, phy: 67 } },
      { id: 'sharipov_m', name: 'Mirjalol Sharipov', pos: 'CB', ovr: 72, stats: { pac: 61, sho: 35, pas: 61, dri: 54, def: 75, phy: 76 } },
      { id: 'raxmatullaev_o', name: 'Otabek Raxmatullaev', pos: 'CB', ovr: 71, stats: { pac: 60, sho: 34, pas: 60, dri: 53, def: 74, phy: 74 } },
      { id: 'yoldoshev_s', name: 'Sanjar Yoldoshev', pos: 'LB', ovr: 70, stats: { pac: 74, sho: 43, pas: 64, dri: 65, def: 68, phy: 63 } },
      { id: 'tursunov_b', name: 'Bexzod Tursunov', pos: 'CDM', ovr: 72, stats: { pac: 62, sho: 54, pas: 71, dri: 66, def: 75, phy: 72 } },
      { id: 'davlatov_e', name: 'Elbek Davlatov', pos: 'CM', ovr: 73, stats: { pac: 69, sho: 66, pas: 76, dri: 74, def: 61, phy: 64 } },
      { id: 'toshpulatov_a', name: 'Asadbek Toshpulatov', pos: 'CAM', ovr: 72, stats: { pac: 70, sho: 70, pas: 74, dri: 77, def: 40, phy: 56 } },
      { id: 'gaipov_r', name: 'Ravshanbek G\u02bbaipov', pos: 'RW', ovr: 71, stats: { pac: 83, sho: 64, pas: 67, dri: 75, def: 28, phy: 54 } },
      { id: 'xudaynazarov_e', name: 'Erkin Xudaynazarov', pos: 'LW', ovr: 70, stats: { pac: 81, sho: 63, pas: 66, dri: 73, def: 27, phy: 53 } },
      { id: 'nabiev_i', name: 'Ibrohim Nabiev', pos: 'ST', ovr: 73, stats: { pac: 77, sho: 74, pas: 61, dri: 72, def: 30, phy: 70 } },

      { id: 'jumaev_a', name: 'Aziz Jumaev', pos: 'GK', ovr: 64, stats: { div: 62, han: 61, kic: 52, ref: 65, spd: 30, pos: 64 } },
      { id: 'saparov_d', name: 'Diyorbek Saparov', pos: 'CB', ovr: 67, stats: { pac: 59, sho: 33, pas: 59, dri: 52, def: 70, phy: 71 } },
      { id: 'eshonqulov_j', name: 'Jaxongir Eshonqulov', pos: 'CM', ovr: 68, stats: { pac: 64, sho: 59, pas: 70, dri: 68, def: 58, phy: 61 } },
      { id: 'komilov_s', name: 'Sardor Komilov', pos: 'ST', ovr: 67, stats: { pac: 74, sho: 68, pas: 55, dri: 67, def: 26, phy: 64 } },
      { id: 'raximberdiev_x', name: 'Xayrulla Raximberdiev', pos: 'RB', ovr: 66, stats: { pac: 70, sho: 40, pas: 60, dri: 61, def: 65, phy: 62 } }
    ]
  },
  {
    id: 'sogdiana',
    name: 'Sogdiana Jizzax',
    logo: '🔵🟡',
    squad: [
      { id: 'ochilov_x', name: 'Xayrullo Ochilov', pos: 'GK', ovr: 70, stats: { div: 70, han: 68, kic: 60, ref: 72, spd: 33, pos: 70 } },
      { id: 'suvonov_j', name: 'Jasurbek Suvonov', pos: 'RB', ovr: 69, stats: { pac: 71, sho: 43, pas: 64, dri: 62, def: 68, phy: 65 } },
      { id: 'norboev_a', name: 'Alisher Norboev', pos: 'CB', ovr: 70, stats: { pac: 59, sho: 33, pas: 59, dri: 52, def: 73, phy: 74 } },
      { id: 'shermatov_b', name: 'Bobur Shermatov', pos: 'CB', ovr: 69, stats: { pac: 58, sho: 32, pas: 58, dri: 51, def: 72, phy: 72 } },
      { id: 'qurbonov_i', name: 'Ilhomjon Qurbonov', pos: 'LB', ovr: 68, stats: { pac: 72, sho: 41, pas: 62, dri: 63, def: 66, phy: 61 } },
      { id: 'jo\u02bbraev_a', name: 'Asqar Jo\u02bbraev', pos: 'CDM', ovr: 70, stats: { pac: 60, sho: 52, pas: 69, dri: 64, def: 73, phy: 70 } },
      { id: 'norqulov_b', name: 'Baxtiyor Norqulov', pos: 'CM', ovr: 71, stats: { pac: 67, sho: 64, pas: 74, dri: 72, def: 59, phy: 62 } },
      { id: 'egamov_j', name: 'Jahongir Egamov', pos: 'CAM', ovr: 70, stats: { pac: 68, sho: 68, pas: 72, dri: 75, def: 38, phy: 54 } },
      { id: 'toirov_d', name: 'Dilmurod Toirov', pos: 'RW', ovr: 69, stats: { pac: 81, sho: 62, pas: 65, dri: 73, def: 26, phy: 52 } },
      { id: 'axmedov_s', name: 'Sherzodbek Axmedov', pos: 'LW', ovr: 68, stats: { pac: 79, sho: 61, pas: 64, dri: 71, def: 25, phy: 51 } },
      { id: 'ne\u02bbmatov_f', name: "Farhod Ne\u02bbmatov", pos: 'ST', ovr: 71, stats: { pac: 75, sho: 72, pas: 59, dri: 70, def: 28, phy: 68 } },

      { id: 'islomov_r', name: 'Ravshanbek Islomov', pos: 'GK', ovr: 62, stats: { div: 60, han: 59, kic: 50, ref: 63, spd: 29, pos: 62 } },
      { id: 'g\u02bbaniev_b', name: "Bexzod G\u02bbaniev", pos: 'CB', ovr: 65, stats: { pac: 57, sho: 31, pas: 57, dri: 50, def: 68, phy: 69 } },
      { id: 'oripov_s', name: 'Sardorbek Oripov', pos: 'CM', ovr: 66, stats: { pac: 62, sho: 57, pas: 68, dri: 66, def: 56, phy: 59 } },
      { id: 'karimov_d', name: 'Doston Karimov', pos: 'ST', ovr: 65, stats: { pac: 72, sho: 66, pas: 53, dri: 65, def: 24, phy: 62 } }
    ]
  },
  {
    id: 'mashal',
    name: 'Mashal Muborak',
    logo: '🟢⚫',
    squad: [
      { id: 'usmonov_a', name: 'Alisher Usmonov', pos: 'GK', ovr: 68, stats: { div: 68, han: 66, kic: 58, ref: 70, spd: 32, pos: 68 } },
      { id: 'norov_j', name: 'Jamshidbek Norov', pos: 'RB', ovr: 67, stats: { pac: 69, sho: 41, pas: 62, dri: 60, def: 66, phy: 63 } },
      { id: 'sattorov_o', name: 'Otabek Sattorov', pos: 'CB', ovr: 68, stats: { pac: 57, sho: 31, pas: 57, dri: 50, def: 71, phy: 72 } },
      { id: 'raxmonberdiev_a', name: 'Anvar Raxmonberdiev', pos: 'CB', ovr: 67, stats: { pac: 56, sho: 30, pas: 56, dri: 49, def: 70, phy: 70 } },
      { id: 'nasriddinov_b', name: 'Bexruz Nasriddinov', pos: 'LB', ovr: 66, stats: { pac: 70, sho: 39, pas: 60, dri: 61, def: 64, phy: 59 } },
      { id: 'zaripov_s', name: 'Shoxjahon Zaripov', pos: 'CDM', ovr: 68, stats: { pac: 58, sho: 50, pas: 67, dri: 62, def: 71, phy: 68 } },
      { id: 'norqo\u02bbziev_i', name: "Ilxom Norqo\u02bbziev", pos: 'CM', ovr: 69, stats: { pac: 65, sho: 62, pas: 72, dri: 70, def: 57, phy: 60 } },
      { id: 'yusupov_f', name: 'Farrux Yusupov', pos: 'CAM', ovr: 68, stats: { pac: 66, sho: 66, pas: 70, dri: 73, def: 36, phy: 52 } },
      { id: 'abdusattorov_m', name: 'Muzaffar Abdusattorov', pos: 'RW', ovr: 67, stats: { pac: 80, sho: 60, pas: 63, dri: 71, def: 25, phy: 50 } },
      { id: 'boboqulov_e', name: 'Elyorbek Boboqulov', pos: 'LW', ovr: 66, stats: { pac: 78, sho: 59, pas: 62, dri: 69, def: 24, phy: 49 } },
      { id: 'nishonov_a', name: 'Aziz Nishonov', pos: 'ST', ovr: 69, stats: { pac: 73, sho: 70, pas: 57, dri: 68, def: 27, phy: 66 } },

      { id: 'mo\u02bbminov_x', name: "Xurshidbek Mo\u02bbminov", pos: 'GK', ovr: 60, stats: { div: 58, han: 57, kic: 48, ref: 61, spd: 28, pos: 60 } },
      { id: 'sobirjonov_a', name: 'Ahror Sobirjonov', pos: 'CB', ovr: 63, stats: { pac: 55, sho: 29, pas: 55, dri: 48, def: 66, phy: 67 } },
      { id: 'quvvatov_j', name: 'Javlonbek Quvvatov', pos: 'CM', ovr: 64, stats: { pac: 60, sho: 55, pas: 66, dri: 64, def: 54, phy: 57 } },
      { id: 'baxromov_d', name: 'Dilshodbek Baxromov', pos: 'ST', ovr: 63, stats: { pac: 70, sho: 64, pas: 51, dri: 63, def: 22, phy: 60 } }
    ]
  },
  {
    id: 'turon',
    name: 'Turon Yaypan',
    logo: '🟠⚫',
    squad: [
      { id: 'raxmatov_j', name: 'Jaxongir Raxmatov', pos: 'GK', ovr: 66, stats: { div: 66, han: 64, kic: 56, ref: 68, spd: 31, pos: 66 } },
      { id: 'egamberdiev_a', name: 'Abdulaziz Egamberdiev', pos: 'RB', ovr: 65, stats: { pac: 67, sho: 39, pas: 60, dri: 58, def: 64, phy: 61 } },
      { id: 'yoqubjonov_s', name: 'Sherali Yoqubjonov', pos: 'CB', ovr: 66, stats: { pac: 55, sho: 29, pas: 55, dri: 48, def: 69, phy: 70 } },
      { id: 'mamasoliev_i', name: 'Ilyosbek Mamasoliev', pos: 'CB', ovr: 65, stats: { pac: 54, sho: 28, pas: 54, dri: 47, def: 68, phy: 68 } },
      { id: 'g\u02bbulomov_r', name: "Ravshan G\u02bbulomov", pos: 'LB', ovr: 64, stats: { pac: 68, sho: 37, pas: 58, dri: 59, def: 62, phy: 57 } },
      { id: 'yusupboev_a', name: 'Alisher Yusupboev', pos: 'CDM', ovr: 66, stats: { pac: 56, sho: 48, pas: 65, dri: 60, def: 69, phy: 66 } },
      { id: 'nabijonov_o', name: 'Otabek Nabijonov', pos: 'CM', ovr: 67, stats: { pac: 63, sho: 60, pas: 70, dri: 68, def: 55, phy: 58 } },
      { id: 'sultonmurodov_j', name: 'Jasur Sultonmurodov', pos: 'RW', ovr: 66, stats: { pac: 79, sho: 58, pas: 61, dri: 70, def: 24, phy: 48 } },
      { id: 'ne\u02bbmonov_b', name: "Bekzod Ne\u02bbmonov", pos: 'LW', ovr: 65, stats: { pac: 77, sho: 57, pas: 60, dri: 68, def: 23, phy: 47 } },
      { id: 'saidaliev_f', name: 'Farhodbek Saidaliev', pos: 'ST', ovr: 67, stats: { pac: 72, sho: 68, pas: 55, dri: 67, def: 26, phy: 64 } },
      { id: 'yormatov_q', name: 'Qahramon Yormatov', pos: 'CAM', ovr: 65, stats: { pac: 64, sho: 63, pas: 68, dri: 71, def: 34, phy: 50 } },

      { id: 'orziqulov_s', name: 'Sardorbek Orziqulov', pos: 'GK', ovr: 58, stats: { div: 56, han: 55, kic: 46, ref: 59, spd: 27, pos: 58 } },
      { id: 'raximov_e', name: 'Elyor Raximov', pos: 'CB', ovr: 61, stats: { pac: 53, sho: 27, pas: 53, dri: 46, def: 64, phy: 65 } },
      { id: 'to\u02bbxtaev_b', name: "Bexruzbek To\u02bbxtaev", pos: 'ST', ovr: 61, stats: { pac: 68, sho: 62, pas: 49, dri: 61, def: 21, phy: 58 } }
    ]
  },
  {
    id: 'kokand1912',
    name: 'Kokand 1912',
    logo: '🔴🟡',
    squad: [
      { id: 'muydinov_a', name: 'Aziz Muydinov', pos: 'GK', ovr: 65, stats: { div: 65, han: 63, kic: 55, ref: 67, spd: 30, pos: 65 } },
      { id: 'raximjonov_b', name: 'Bexzod Raximjonov', pos: 'RB', ovr: 64, stats: { pac: 66, sho: 38, pas: 59, dri: 57, def: 63, phy: 60 } },
      { id: 'muxtorov_s', name: 'Sherzodbek Muxtorov', pos: 'CB', ovr: 65, stats: { pac: 54, sho: 28, pas: 54, dri: 47, def: 68, phy: 69 } },
      { id: 'nurmatov_j', name: 'Jaxongir Nurmatov', pos: 'CB', ovr: 64, stats: { pac: 53, sho: 27, pas: 53, dri: 46, def: 67, phy: 67 } },
      { id: 'yoqubov_x', name: 'Xurshid Yoqubov', pos: 'LB', ovr: 63, stats: { pac: 67, sho: 36, pas: 57, dri: 58, def: 61, phy: 56 } },
      { id: 'to\u02bbraqulov_a', name: "Abror To\u02bbraqulov", pos: 'CDM', ovr: 65, stats: { pac: 55, sho: 47, pas: 64, dri: 59, def: 68, phy: 65 } },
      { id: 'yigitaliev_d', name: 'Doniyorbek Yigitaliev', pos: 'CM', ovr: 66, stats: { pac: 62, sho: 59, pas: 69, dri: 67, def: 54, phy: 57 } },
      { id: 'abdujabborov_r', name: 'Rustambek Abdujabborov', pos: 'CAM', ovr: 65, stats: { pac: 63, sho: 62, pas: 67, dri: 70, def: 33, phy: 49 } },
      { id: 'nazrullaev_j', name: 'Jasurbek Nazrullaev', pos: 'RW', ovr: 64, stats: { pac: 78, sho: 57, pas: 60, dri: 69, def: 23, phy: 47 } },
      { id: 'olimov_a', name: 'Akmaljon Olimov', pos: 'LW', ovr: 63, stats: { pac: 76, sho: 56, pas: 59, dri: 67, def: 22, phy: 46 } },
      { id: 'boyto\u02bbraev_e', name: "Elbek Boyto\u02bbraev", pos: 'ST', ovr: 66, stats: { pac: 71, sho: 67, pas: 54, dri: 66, def: 25, phy: 63 } },

      { id: 'ne\u02bbmatjonov_s', name: "Sardor Ne\u02bbmatjonov", pos: 'GK', ovr: 57, stats: { div: 55, han: 54, kic: 45, ref: 58, spd: 26, pos: 57 } },
      { id: 'oxunjonov_i', name: 'Ilxombek Oxunjonov', pos: 'CB', ovr: 60, stats: { pac: 52, sho: 26, pas: 52, dri: 45, def: 63, phy: 64 } },
      { id: 'shermatov_j', name: 'Jamoliddin Shermatov', pos: 'CM', ovr: 61, stats: { pac: 58, sho: 54, pas: 65, dri: 63, def: 51, phy: 55 } }
    ]
  },
  {
    id: 'surxon',
    name: 'Surxon Termiz',
    logo: '⚪🔵',
    squad: [
      { id: 'boltaboev_r', name: 'Ravshan Boltaboev', pos: 'GK', ovr: 66, stats: { div: 66, han: 64, kic: 56, ref: 68, spd: 31, pos: 66 } },
      { id: 'safarov_j', name: 'Jasur Safarov', pos: 'RB', ovr: 65, stats: { pac: 67, sho: 39, pas: 60, dri: 58, def: 64, phy: 61 } },
      { id: 'nazarov_s', name: 'Shuxrat Nazarov', pos: 'CB', ovr: 66, stats: { pac: 55, sho: 29, pas: 55, dri: 48, def: 69, phy: 70 } },
      { id: 'ergashev_o', name: 'Otabek Ergashev', pos: 'CB', ovr: 65, stats: { pac: 54, sho: 28, pas: 54, dri: 47, def: 68, phy: 68 } },
      { id: 'no\u02bbmonov_b', name: "Baxtiyor No\u02bbmonov", pos: 'LB', ovr: 64, stats: { pac: 68, sho: 37, pas: 58, dri: 59, def: 62, phy: 57 } },
      { id: 'raxmonqulov_a', name: 'Alisher Raxmonqulov', pos: 'CDM', ovr: 66, stats: { pac: 56, sho: 48, pas: 65, dri: 60, def: 69, phy: 66 } },
      { id: 'yormatov_d', name: 'Dilshod Yormatov', pos: 'CM', ovr: 67, stats: { pac: 63, sho: 60, pas: 70, dri: 68, def: 55, phy: 58 } },
      { id: 'jo\u02bbrayev_b', name: "Behruz Jo\u02bbrayev", pos: 'CAM', ovr: 66, stats: { pac: 64, sho: 63, pas: 68, dri: 71, def: 34, phy: 50 } },
      { id: 'usmonaliev_i', name: 'Ismoiljon Usmonaliev', pos: 'RW', ovr: 65, stats: { pac: 79, sho: 58, pas: 61, dri: 70, def: 24, phy: 48 } },
      { id: 'ravshanov_j', name: 'Jaxongir Ravshanov', pos: 'LW', ovr: 64, stats: { pac: 77, sho: 57, pas: 60, dri: 68, def: 23, phy: 47 } },
      { id: 'muhammadiev_a', name: 'Aziz Muhammadiev', pos: 'ST', ovr: 67, stats: { pac: 72, sho: 68, pas: 55, dri: 67, def: 26, phy: 64 } },

      { id: 'ubaydullaev_r', name: 'Ruslan Ubaydullaev', pos: 'GK', ovr: 58, stats: { div: 56, han: 55, kic: 46, ref: 59, spd: 27, pos: 58 } },
      { id: 'norboev_j', name: 'Jasurbek Norboev', pos: 'CB', ovr: 61, stats: { pac: 53, sho: 27, pas: 53, dri: 46, def: 64, phy: 65 } },
      { id: 'to\u02bbychiev_a', name: "Abbos To\u02bbychiev", pos: 'ST', ovr: 62, stats: { pac: 69, sho: 63, pas: 50, dri: 62, def: 22, phy: 59 } }
    ]
  },
  {
    id: 'metallurg',
    name: 'Metallurg Bekobod',
    logo: '🔵⚫',
    squad: [
      { id: 'boboqandov_a', name: 'Abdulla Boboqandov', pos: 'GK', ovr: 64, stats: { div: 64, han: 62, kic: 54, ref: 66, spd: 30, pos: 64 } },
      { id: 'sotvoldiev_r', name: 'Ravshanbek Sotvoldiev', pos: 'RB', ovr: 63, stats: { pac: 65, sho: 37, pas: 58, dri: 56, def: 62, phy: 59 } },
      { id: 'olloberganov_s', name: 'Sherzod Olloberganov', pos: 'CB', ovr: 64, stats: { pac: 53, sho: 27, pas: 53, dri: 46, def: 67, phy: 68 } },
      { id: 'muxammadaliev_i', name: 'Ilhom Muxammadaliev', pos: 'CB', ovr: 63, stats: { pac: 52, sho: 26, pas: 52, dri: 45, def: 66, phy: 66 } },
      { id: 'norqobilov_a', name: 'Anvarbek Norqobilov', pos: 'LB', ovr: 62, stats: { pac: 66, sho: 35, pas: 56, dri: 57, def: 60, phy: 55 } },
      { id: 'sotvoldiev_e', name: 'Elbek Sotvoldiev', pos: 'CDM', ovr: 64, stats: { pac: 54, sho: 46, pas: 63, dri: 58, def: 67, phy: 64 } },
      { id: 'juraev_i', name: 'Ismoil Juraev', pos: 'CM', ovr: 65, stats: { pac: 61, sho: 58, pas: 68, dri: 66, def: 53, phy: 56 } },
      { id: 'abdusalomov_j', name: 'Jaloliddin Abdusalomov', pos: 'CAM', ovr: 64, stats: { pac: 62, sho: 61, pas: 66, dri: 69, def: 32, phy: 48 } },
      { id: 'raxmonov_b', name: 'Baxtiyorbek Raxmonov', pos: 'RW', ovr: 63, stats: { pac: 77, sho: 56, pas: 59, dri: 68, def: 22, phy: 46 } },
      { id: 'nazarqulov_s', name: 'Sardorbek Nazarqulov', pos: 'LW', ovr: 62, stats: { pac: 75, sho: 55, pas: 58, dri: 66, def: 21, phy: 45 } },
      { id: 'islomov_f', name: 'Farxodbek Islomov', pos: 'ST', ovr: 65, stats: { pac: 70, sho: 66, pas: 53, dri: 65, def: 24, phy: 62 } },

      { id: 'raximov_g', name: "G\u02bboyibnazar Raximov", pos: 'GK', ovr: 56, stats: { div: 54, han: 53, kic: 44, ref: 57, spd: 25, pos: 56 } },
      { id: 'nasimov_e', name: 'Elyorbek Nasimov', pos: 'CB', ovr: 59, stats: { pac: 51, sho: 25, pas: 51, dri: 44, def: 62, phy: 63 } },
      { id: 'yusupov_z', name: 'Zafarbek Yusupov', pos: 'CM', ovr: 60, stats: { pac: 57, sho: 53, pas: 64, dri: 62, def: 50, phy: 54 } }
    ]
  },
  {
    id: 'shortan',
    name: "Sho\u02bbrtan G\u02bbuzor",
    logo: '🟡🔴',
    squad: [
      { id: 'yuldashboev_o', name: 'Otabek Yuldashboev', pos: 'GK', ovr: 63, stats: { div: 63, han: 61, kic: 53, ref: 65, spd: 29, pos: 63 } },
      { id: 'raxmatjonov_s', name: 'Sardorbek Raxmatjonov', pos: 'RB', ovr: 62, stats: { pac: 64, sho: 36, pas: 57, dri: 55, def: 61, phy: 58 } },
      { id: 'zokirjonov_a', name: 'Alisherbek Zokirjonov', pos: 'CB', ovr: 63, stats: { pac: 52, sho: 26, pas: 52, dri: 45, def: 66, phy: 67 } },
      { id: 'no\u02bbmonjonov_i', name: "Ilyosbek No\u02bbmonjonov", pos: 'CB', ovr: 62, stats: { pac: 51, sho: 25, pas: 51, dri: 44, def: 65, phy: 65 } },
      { id: 'davronbekov_j', name: 'Jaxongirbek Davronbekov', pos: 'LB', ovr: 61, stats: { pac: 65, sho: 34, pas: 55, dri: 56, def: 59, phy: 54 } },
      { id: 'muhitdinov_b', name: 'Baxtiyor Muhitdinov', pos: 'CDM', ovr: 63, stats: { pac: 53, sho: 45, pas: 62, dri: 57, def: 66, phy: 63 } },
      { id: 'ahrorov_d', name: 'Dilshodbek Ahrorov', pos: 'CM', ovr: 64, stats: { pac: 60, sho: 57, pas: 67, dri: 65, def: 52, phy: 55 } },
      { id: 'ne\u02bbmatov_r', name: "Rustambek Ne\u02bbmatov", pos: 'CAM', ovr: 63, stats: { pac: 61, sho: 60, pas: 65, dri: 68, def: 31, phy: 47 } },
      { id: 'ochilov_e', name: 'Elbek Ochilov', pos: 'RW', ovr: 62, stats: { pac: 76, sho: 55, pas: 58, dri: 67, def: 21, phy: 45 } },
      { id: 'shokirov_a', name: 'Asqarbek Shokirov', pos: 'LW', ovr: 61, stats: { pac: 74, sho: 54, pas: 57, dri: 65, def: 20, phy: 44 } },
      { id: 'quvonchbekov_t', name: 'To\u02bblqin Quvonchbekov', pos: 'ST', ovr: 64, stats: { pac: 69, sho: 65, pas: 52, dri: 64, def: 23, phy: 61 } },

      { id: 'sotiboldiev_a', name: 'Ahliddin Sotiboldiev', pos: 'GK', ovr: 55, stats: { div: 53, han: 52, kic: 43, ref: 56, spd: 24, pos: 55 } },
      { id: 'yusupjonov_r', name: 'Ravshanjon Yusupjonov', pos: 'CB', ovr: 58, stats: { pac: 50, sho: 24, pas: 50, dri: 43, def: 61, phy: 62 } },
      { id: 'bekchanov_i', name: 'Ilhomjon Bekchanov', pos: 'ST', ovr: 59, stats: { pac: 68, sho: 62, pas: 49, dri: 61, def: 20, phy: 58 } }
    ]
  },
  {
    id: 'al_hilal',
    name: 'Al Hilal',
    logo: '🔵⚪',
    squad: [
      { id: 'bono', name: 'Yassine Bounou', pos: 'GK', ovr: 86, stats: { div: 86, han: 84, kic: 78, ref: 88, spd: 44, pos: 86 } },
      { id: 'cancelo_j', name: 'Joao Cancelo', pos: 'RB', ovr: 84, stats: { pac: 82, sho: 68, pas: 85, dri: 84, def: 78, phy: 74 }, altPos: ['LB'] },
      { id: 'koulibaly_k', name: 'Kalidou Koulibaly', pos: 'CB', ovr: 85, stats: { pac: 78, sho: 42, pas: 74, dri: 68, def: 88, phy: 89 } },
      { id: 'al_bulayhi_a', name: 'Ali Al-Bulayhi', pos: 'CB', ovr: 76, stats: { pac: 68, sho: 38, pas: 66, dri: 60, def: 79, phy: 81 } },
      { id: 'malcom', name: 'Malcom', pos: 'LW', ovr: 83, stats: { pac: 88, sho: 79, pas: 76, dri: 87, def: 34, phy: 66 }, altPos: ['RW'] },
      { id: 'kante_ng', name: "N'Golo Kante", pos: 'CDM', ovr: 84, stats: { pac: 72, sho: 62, pas: 79, dri: 79, def: 87, phy: 78 } },
      { id: 'milinkovic_savic_s', name: 'Sergej Milinkovic-Savic', pos: 'CM', ovr: 85, stats: { pac: 73, sho: 82, pas: 83, dri: 84, def: 65, phy: 82 }, altPos: ['CAM'] },
      { id: 'neves_r', name: 'Ruben Neves', pos: 'CDM', ovr: 84, stats: { pac: 66, sho: 74, pas: 85, dri: 80, def: 76, phy: 74 } },
      { id: 'mitrovic_a', name: 'Aleksandar Mitrovic', pos: 'ST', ovr: 83, stats: { pac: 71, sho: 85, pas: 60, dri: 74, def: 33, phy: 87 } },
      { id: 'al_dawsari_s', name: 'Salem Al-Dawsari', pos: 'RW', ovr: 82, stats: { pac: 84, sho: 80, pas: 78, dri: 86, def: 35, phy: 62 } },
      { id: 'al_shehri_s', name: 'Saleh Al-Shehri', pos: 'ST', ovr: 78, stats: { pac: 79, sho: 79, pas: 60, dri: 74, def: 30, phy: 73 } },

      { id: 'al_owais_m', name: 'Mohammed Al-Owais', pos: 'GK', ovr: 74, stats: { div: 73, han: 71, kic: 64, ref: 75, spd: 36, pos: 74 } },
      { id: 'al_yami_h', name: 'Hamad Al-Yami', pos: 'RB', ovr: 71, stats: { pac: 72, sho: 44, pas: 63, dri: 62, def: 70, phy: 66 } },
      { id: 'al_amri_m', name: 'Mohammed Al-Breik', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 36, pas: 62, dri: 55, def: 75, phy: 76 } },
      { id: 'lodi_r', name: 'Renan Lodi', pos: 'LB', ovr: 79, stats: { pac: 84, sho: 55, pas: 76, dri: 80, def: 72, phy: 69 } },
      { id: 'al_faraj_s', name: 'Salman Al-Faraj', pos: 'CM', ovr: 76, stats: { pac: 60, sho: 68, pas: 79, dri: 74, def: 58, phy: 63 } },
      { id: 'kabore_i', name: 'Issam Kabore', pos: 'RB', ovr: 70, stats: { pac: 79, sho: 45, pas: 62, dri: 66, def: 66, phy: 62 } }
    ]
  },
  {
    id: 'al_nassr',
    name: 'Al Nassr',
    logo: '🟡🔵',
    squad: [
      { id: 'bento', name: 'Bento', pos: 'GK', ovr: 79, stats: { div: 79, han: 77, kic: 68, ref: 81, spd: 40, pos: 79 } },
      { id: 'sultan_al_ghannam', name: 'Sultan Al-Ghannam', pos: 'RB', ovr: 74, stats: { pac: 76, sho: 47, pas: 68, dri: 66, def: 73, phy: 68 } },
      { id: 'laporte_a', name: 'Aymeric Laporte', pos: 'CB', ovr: 84, stats: { pac: 70, sho: 42, pas: 79, dri: 68, def: 87, phy: 84 } },
      { id: 'al_amri_a', name: 'Abdulelah Al-Amri', pos: 'CB', ovr: 75, stats: { pac: 66, sho: 37, pas: 64, dri: 58, def: 78, phy: 79 } },
      { id: 'mane_s', name: 'Sadio Mane', pos: 'LW', ovr: 85, stats: { pac: 90, sho: 82, pas: 76, dri: 87, def: 40, phy: 74 }, altPos: ['RW'] },
      { id: 'brozovic_m', name: 'Marcelo Brozovic', pos: 'CDM', ovr: 83, stats: { pac: 65, sho: 71, pas: 84, dri: 78, def: 78, phy: 73 } },
      { id: 'gomes_a', name: 'Angelo Gomes', pos: 'CM', ovr: 77, stats: { pac: 74, sho: 68, pas: 78, dri: 79, def: 62, phy: 65 } },
      { id: 'ronaldo_c', name: 'Cristiano Ronaldo', pos: 'ST', ovr: 87, stats: { pac: 79, sho: 91, pas: 76, dri: 84, def: 33, phy: 76 } },
      { id: 'talisca_a', name: 'Anderson Talisca', pos: 'CAM', ovr: 82, stats: { pac: 74, sho: 84, pas: 78, dri: 83, def: 38, phy: 68 }, altPos: ['ST'] },
      { id: 'otavio', name: 'Otavio', pos: 'RW', ovr: 82, stats: { pac: 79, sho: 76, pas: 82, dri: 83, def: 48, phy: 65 } },
      { id: 'wesley_r', name: 'Wesley', pos: 'LB', ovr: 74, stats: { pac: 80, sho: 51, pas: 69, dri: 72, def: 71, phy: 66 } },

      { id: 'nawaf_al_aqidi', name: 'Nawaf Al-Aqidi', pos: 'GK', ovr: 72, stats: { div: 71, han: 69, kic: 62, ref: 73, spd: 35, pos: 72 } },
      { id: 'al_najei_a', name: 'Ali Lajami', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 35, pas: 61, dri: 54, def: 75, phy: 76 } },
      { id: 'sultan_al_ghannam2', name: 'Ayman Yahya', pos: 'CM', ovr: 71, stats: { pac: 65, sho: 62, pas: 71, dri: 68, def: 58, phy: 62 } },
      { id: 'abdullah_al_khaibari', name: 'Abdullah Al-Khaibari', pos: 'RW', ovr: 73, stats: { pac: 82, sho: 65, pas: 68, dri: 76, def: 30, phy: 56 } },
      { id: 'mrezigue_a', name: 'Ahmed Sharahili', pos: 'ST', ovr: 70, stats: { pac: 76, sho: 71, pas: 57, dri: 69, def: 28, phy: 67 } }
    ]
  },
  {
    id: 'al_ittihad',
    name: 'Al Ittihad',
    logo: '⚫🟡',
    squad: [
      { id: 'al_aqidi_m', name: 'Marcelo Grohe', pos: 'GK', ovr: 78, stats: { div: 78, han: 76, kic: 67, ref: 80, spd: 39, pos: 78 } },
      { id: 'hamdallah_a', name: 'Ahmed Hegazi', pos: 'CB', ovr: 76, stats: { pac: 66, sho: 39, pas: 65, dri: 58, def: 79, phy: 80 } },
      { id: 'kante_f', name: 'Fabinho', pos: 'CDM', ovr: 83, stats: { pac: 68, sho: 62, pas: 79, dri: 74, def: 84, phy: 82 } },
      { id: 'jota_r', name: 'Romarinho Jota', pos: 'RW', ovr: 79, stats: { pac: 82, sho: 74, pas: 74, dri: 81, def: 32, phy: 60 } },
      { id: 'benzema_k', name: 'Karim Benzema', pos: 'ST', ovr: 86, stats: { pac: 74, sho: 87, pas: 80, dri: 85, def: 38, phy: 76 } },
      { id: 'kessie_f', name: 'Franck Kessie', pos: 'CM', ovr: 81, stats: { pac: 72, sho: 74, pas: 76, dri: 78, def: 74, phy: 82 } },
      { id: 'al_shanqiti_h', name: 'Hassan Kadesh', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 36, pas: 63, dri: 56, def: 77, phy: 78 } },
      { id: 'al_muwallad_s', name: 'Salem Al-Najdi', pos: 'LW', ovr: 76, stats: { pac: 85, sho: 70, pas: 70, dri: 78, def: 29, phy: 58 } },
      { id: 'romao_r', name: 'Igor Coronado', pos: 'CAM', ovr: 79, stats: { pac: 76, sho: 76, pas: 82, dri: 82, def: 40, phy: 60 } },
      { id: 'al_shanqiti_h2', name: 'Yehia Zakaria', pos: 'RB', ovr: 73, stats: { pac: 77, sho: 46, pas: 67, dri: 65, def: 72, phy: 68 } },
      { id: 'al_hamdan_h', name: 'Hassan Al-Hamdan', pos: 'LB', ovr: 72, stats: { pac: 75, sho: 45, pas: 66, dri: 64, def: 71, phy: 66 } },

      { id: 'moussa_a', name: 'Ahmed Bamsaud', pos: 'GK', ovr: 68, stats: { div: 66, han: 65, kic: 56, ref: 69, spd: 33, pos: 68 } },
      { id: 'baghdad_b', name: 'Baghdad Bounedjah', pos: 'ST', ovr: 76, stats: { pac: 75, sho: 78, pas: 58, dri: 73, def: 27, phy: 70 } },
      { id: 'al_ghamdi_a', name: 'Amin Al-Ghamdi', pos: 'CM', ovr: 70, stats: { pac: 66, sho: 61, pas: 70, dri: 67, def: 57, phy: 61 } }
    ]
  },
  {
    id: 'al_ahli_sa',
    name: 'Al Ahli Saudi',
    logo: '🟢⚪',
    squad: [
      { id: 'ederson_m2', name: 'Ivan Cropper', pos: 'GK', ovr: 76, stats: { div: 76, han: 74, kic: 65, ref: 78, spd: 38, pos: 76 } },
      { id: 'maran_r', name: 'Roger Ibanez', pos: 'CB', ovr: 79, stats: { pac: 74, sho: 40, pas: 69, dri: 62, def: 82, phy: 83 } },
      { id: 'kessie_i', name: 'Ibrahima Toure', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 37, pas: 62, dri: 56, def: 77, phy: 78 } },
      { id: 'kante_g', name: 'Gabri Veiga', pos: 'CM', ovr: 80, stats: { pac: 75, sho: 76, pas: 81, dri: 82, def: 58, phy: 68 } },
      { id: 'mahrez_r', name: 'Riyad Mahrez', pos: 'RW', ovr: 84, stats: { pac: 78, sho: 82, pas: 84, dri: 87, def: 34, phy: 58 } },
      { id: 'firmino_r', name: 'Roberto Firmino', pos: 'ST', ovr: 81, stats: { pac: 68, sho: 79, pas: 80, dri: 82, def: 42, phy: 71 }, altPos: ['CAM'] },
      { id: 'kante_a', name: 'Allan Saint-Maximin', pos: 'LW', ovr: 79, stats: { pac: 89, sho: 71, pas: 70, dri: 85, def: 28, phy: 65 } },
      { id: 'ali_al_bulaihi', name: 'Ahmed Sharahili', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 44, pas: 65, dri: 63, def: 70, phy: 65 } },
      { id: 'karim_al_shubli', name: 'Karim Al-Shubli', pos: 'LB', ovr: 72, stats: { pac: 76, sho: 45, pas: 66, dri: 65, def: 71, phy: 66 } },
      { id: 'al_hassan_i', name: 'Ibrahim Al-Hassan', pos: 'CDM', ovr: 72, stats: { pac: 62, sho: 55, pas: 71, dri: 66, def: 74, phy: 71 } },
      { id: 'demiral_m', name: 'Merih Demiral', pos: 'CB', ovr: 80, stats: { pac: 71, sho: 39, pas: 66, dri: 60, def: 83, phy: 85 } },

      { id: 'waleed_a', name: 'Waleed Abdullah', pos: 'GK', ovr: 69, stats: { div: 67, han: 66, kic: 57, ref: 70, spd: 34, pos: 69 } },
      { id: 'mohammed_al_qahtani', name: 'Mohammed Al-Qahtani', pos: 'CM', ovr: 69, stats: { pac: 64, sho: 60, pas: 69, dri: 66, def: 56, phy: 60 } },
      { id: 'abdulrahman_ghareeb', name: 'Abdulrahman Ghareeb', pos: 'ST', ovr: 71, stats: { pac: 78, sho: 70, pas: 55, dri: 70, def: 26, phy: 65 } }
    ]
  },
  {
    id: 'al_taawoun',
    name: 'Al-Taawoun',
    logo: '🟡⚫',
    squad: [
      { id: 'al_habsi_h', name: 'Hussein Al-Salem', pos: 'GK', ovr: 71, stats: { div: 71, han: 69, kic: 61, ref: 73, spd: 35, pos: 71 } },
      { id: 'ghanem_m', name: 'Mansour Al-Fahmi', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 35, pas: 61, dri: 54, def: 75, phy: 76 } },
      { id: 'al_amri_t', name: 'Turki Al-Ammar', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 34, pas: 60, dri: 53, def: 74, phy: 74 } },
      { id: 'traore_h', name: 'Hadi Sacko', pos: 'RW', ovr: 76, stats: { pac: 87, sho: 68, pas: 68, dri: 79, def: 27, phy: 60 } },
      { id: 'mane_m', name: 'Musa Al-Taamari', pos: 'LW', ovr: 78, stats: { pac: 86, sho: 74, pas: 72, dri: 80, def: 30, phy: 62 } },
      { id: 'romarinho_r', name: 'Romarinho', pos: 'CAM', ovr: 76, stats: { pac: 75, sho: 75, pas: 77, dri: 80, def: 36, phy: 58 } },
      { id: 'al_dossari_n', name: 'Nasser Al-Dossari', pos: 'CM', ovr: 71, stats: { pac: 67, sho: 63, pas: 71, dri: 69, def: 58, phy: 61 } },
      { id: 'wanderson_w', name: 'Wanderson', pos: 'ST', ovr: 74, stats: { pac: 78, sho: 76, pas: 60, dri: 73, def: 29, phy: 70 } },
      { id: 'al_ghamdi_o', name: 'Omar Al-Somah', pos: 'ST', ovr: 76, stats: { pac: 73, sho: 79, pas: 59, dri: 72, def: 27, phy: 74 } },
      { id: 'al_saeed_a', name: 'Abdulaziz Al-Saeed', pos: 'RB', ovr: 70, stats: { pac: 73, sho: 43, pas: 63, dri: 62, def: 69, phy: 65 } },
      { id: 'al_ghamdi_s', name: 'Saad Al-Ghamdi', pos: 'LB', ovr: 69, stats: { pac: 72, sho: 42, pas: 62, dri: 61, def: 68, phy: 64 } },

      { id: 'al_ruwaili_f', name: 'Fahad Al-Ruwaili', pos: 'GK', ovr: 63, stats: { div: 61, han: 60, kic: 51, ref: 64, spd: 29, pos: 63 } },
      { id: 'al_ghamdi_k', name: 'Khalid Al-Ghamdi', pos: 'CDM', ovr: 68, stats: { pac: 58, sho: 50, pas: 67, dri: 62, def: 71, phy: 68 } }
    ]
  },
  {
    id: 'al_ettifaq',
    name: 'Al-Ettifaq',
    logo: '🔴⚫',
    squad: [
      { id: 'shrydi_h', name: 'Habib Shuraydi', pos: 'GK', ovr: 70, stats: { div: 70, han: 68, kic: 60, ref: 72, spd: 34, pos: 70 } },
      { id: 'wijnaldum_g', name: 'Georginio Wijnaldum', pos: 'CM', ovr: 80, stats: { pac: 66, sho: 74, pas: 80, dri: 78, def: 68, phy: 74 } },
      { id: 'al_ghamdi_r', name: 'Riyadh Sharahili', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 35, pas: 61, dri: 54, def: 75, phy: 76 } },
      { id: 'moukoudi_h', name: 'Harold Moukoudi', pos: 'CB', ovr: 73, stats: { pac: 68, sho: 37, pas: 62, dri: 56, def: 76, phy: 79 } },
      { id: 'sadio_diallo', name: 'Sadio Diallo', pos: 'LB', ovr: 71, stats: { pac: 78, sho: 44, pas: 64, dri: 66, def: 69, phy: 64 } },
      { id: 'kessie_m', name: 'Moussa Dembele', pos: 'ST', ovr: 76, stats: { pac: 72, sho: 78, pas: 58, dri: 73, def: 28, phy: 74 } },
      { id: 'al_hassan_a', name: 'Abdulrahman Al-Yami', pos: 'RW', ovr: 72, stats: { pac: 83, sho: 63, pas: 66, dri: 75, def: 27, phy: 55 } },
      { id: 'karim_a', name: 'Amrabat Sofyan', pos: 'CDM', ovr: 79, stats: { pac: 70, sho: 60, pas: 74, dri: 74, def: 82, phy: 79 } },
      { id: 'al_dawsari_n', name: 'Nawaf Al-Dawsari', pos: 'CAM', ovr: 71, stats: { pac: 70, sho: 69, pas: 71, dri: 74, def: 35, phy: 52 } },
      { id: 'al_shammari_n2', name: 'Naif Al-Shammari', pos: 'RB', ovr: 69, stats: { pac: 73, sho: 42, pas: 62, dri: 61, def: 68, phy: 64 } },

      { id: 'al_qahtani_m', name: 'Musab Al-Qahtani', pos: 'GK', ovr: 62, stats: { div: 60, han: 59, kic: 50, ref: 63, spd: 28, pos: 62 } },
      { id: 'al_juwayr_a', name: 'Ali Al-Juwayr', pos: 'CM', ovr: 68, stats: { pac: 64, sho: 59, pas: 68, dri: 66, def: 56, phy: 60 } }
    ]
  },
  {
    id: 'urawa_reds',
    name: 'Urawa Red Diamonds',
    logo: '🔴⚪',
    squad: [
      { id: 'nishikawa_s', name: 'Shusaku Nishikawa', pos: 'GK', ovr: 78, stats: { div: 78, han: 76, kic: 68, ref: 80, spd: 38, pos: 78 } },
      { id: 'ishikawa_t', name: 'Takuya Ishikawa', pos: 'RB', ovr: 73, stats: { pac: 76, sho: 46, pas: 68, dri: 66, def: 72, phy: 68 } },
      { id: 'akashi_m', name: 'Marius Hoibraten', pos: 'CB', ovr: 76, stats: { pac: 66, sho: 38, pas: 65, dri: 58, def: 79, phy: 82 } },
      { id: 'ishikawa_h', name: 'Hiroki Sakai', pos: 'CB', ovr: 75, stats: { pac: 68, sho: 39, pas: 66, dri: 60, def: 78, phy: 78 } },
      { id: 'yamane_t', name: 'Takuma Ominami', pos: 'LB', ovr: 73, stats: { pac: 77, sho: 45, pas: 67, dri: 68, def: 71, phy: 66 } },
      { id: 'onishi_t', name: 'Takahiro Sekine', pos: 'CDM', ovr: 74, stats: { pac: 65, sho: 55, pas: 74, dri: 68, def: 77, phy: 73 } },
      { id: 'ishikawa_s', name: 'Shinzo Koroki', pos: 'ST', ovr: 76, stats: { pac: 70, sho: 78, pas: 62, dri: 74, def: 30, phy: 71 } },
      { id: 'akaji_y', name: 'Yusuke Matsuo', pos: 'RW', ovr: 74, stats: { pac: 85, sho: 66, pas: 68, dri: 77, def: 28, phy: 55 } },
      { id: 'komiyama_t', name: 'Takuro Kaneko', pos: 'CAM', ovr: 75, stats: { pac: 72, sho: 71, pas: 77, dri: 78, def: 40, phy: 56 } },
      { id: 'akiyama_a', name: 'Ataru Esaka', pos: 'CM', ovr: 74, stats: { pac: 70, sho: 66, pas: 76, dri: 74, def: 60, phy: 62 } },
      { id: 'suzuki_r', name: 'Kai Watanabe', pos: 'LW', ovr: 73, stats: { pac: 83, sho: 65, pas: 66, dri: 75, def: 27, phy: 54 } },

      { id: 'nishikawa_h2', name: 'Hiroki Iikura', pos: 'GK', ovr: 68, stats: { div: 66, han: 65, kic: 56, ref: 69, spd: 33, pos: 68 } },
      { id: 'tomiyasu_r', name: 'Ryoma Watanabe', pos: 'ST', ovr: 71, stats: { pac: 76, sho: 73, pas: 56, dri: 71, def: 27, phy: 66 } },
      { id: 'nishio_k', name: 'Kanta Chiba', pos: 'CM', ovr: 70, stats: { pac: 65, sho: 60, pas: 71, dri: 68, def: 57, phy: 60 } }
    ]
  },
  {
    id: 'kawasaki_frontale',
    name: 'Kawasaki Frontale',
    logo: '⚫🔵',
    squad: [
      { id: 'jung_seong_ryong', name: 'Sung Ryong Jung', pos: 'GK', ovr: 76, stats: { div: 76, han: 74, kic: 66, ref: 78, spd: 37, pos: 76 } },
      { id: 'yamane_k', name: 'Kein Sato', pos: 'RB', ovr: 73, stats: { pac: 77, sho: 45, pas: 68, dri: 67, def: 71, phy: 67 } },
      { id: 'jesiel', name: 'Jesiel', pos: 'CB', ovr: 76, stats: { pac: 67, sho: 39, pas: 65, dri: 58, def: 79, phy: 81 } },
      { id: 'yamane_h', name: 'Ho Yamane', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 37, pas: 64, dri: 56, def: 77, phy: 78 } },
      { id: 'oshima_r', name: 'Ryota Oshima', pos: 'CM', ovr: 77, stats: { pac: 70, sho: 70, pas: 79, dri: 76, def: 63, phy: 66 } },
      { id: 'yajima_h', name: 'Hayato Nakama', pos: 'LB', ovr: 72, stats: { pac: 76, sho: 44, pas: 67, dri: 67, def: 70, phy: 65 } },
      { id: 'ienaga_a', name: 'Akihiro Ienaga', pos: 'CAM', ovr: 78, stats: { pac: 71, sho: 74, pas: 80, dri: 80, def: 42, phy: 58 } },
      { id: 'mitoma_y', name: 'Yuto Mitoma', pos: 'LW', ovr: 76, stats: { pac: 86, sho: 68, pas: 69, dri: 80, def: 29, phy: 56 } },
      { id: 'shimizu_s', name: 'Shogo Taniguchi', pos: 'CDM', ovr: 74, stats: { pac: 64, sho: 55, pas: 73, dri: 67, def: 77, phy: 73 } },
      { id: 'kobayashi_y', name: 'Yu Kobayashi', pos: 'ST', ovr: 78, stats: { pac: 72, sho: 79, pas: 63, dri: 75, def: 31, phy: 74 } },
      { id: 'ienaga_m', name: 'Miki Yamane', pos: 'RW', ovr: 75, stats: { pac: 84, sho: 67, pas: 70, dri: 78, def: 30, phy: 57 } },

      { id: 'sochi_k', name: 'Kento Sochi', pos: 'GK', ovr: 66, stats: { div: 64, han: 63, kic: 54, ref: 67, spd: 32, pos: 66 } },
      { id: 'mook_h', name: 'Haruya Ide', pos: 'ST', ovr: 70, stats: { pac: 78, sho: 71, pas: 55, dri: 70, def: 26, phy: 65 } },
      { id: 'kurumaya_s', name: 'Shinnosuke Nakatani', pos: 'CB', ovr: 70, stats: { pac: 61, sho: 34, pas: 60, dri: 53, def: 73, phy: 74 } }
    ]
  },
  {
    id: 'vissel_kobe',
    name: 'Vissel Kobe',
    logo: '🌹🔴',
    squad: [
      { id: 'suzuki_k', name: 'Kosuke Nakamura', pos: 'GK', ovr: 74, stats: { div: 74, han: 72, kic: 63, ref: 76, spd: 36, pos: 74 } },
      { id: 'nishi_h', name: 'Hotaru Yamaguchi', pos: 'CDM', ovr: 76, stats: { pac: 66, sho: 58, pas: 76, dri: 71, def: 78, phy: 74 } },
      { id: 'kimura_y', name: 'Yuya Osako', pos: 'ST', ovr: 78, stats: { pac: 69, sho: 79, pas: 65, dri: 74, def: 33, phy: 78 } },
      { id: 'sanpei_r', name: 'Ryo Hatsuse', pos: 'RB', ovr: 74, stats: { pac: 79, sho: 47, pas: 69, dri: 68, def: 72, phy: 68 } },
      { id: 'daiki_hashioka', name: 'Daiki Hashioka', pos: 'RB', ovr: 75, stats: { pac: 80, sho: 48, pas: 70, dri: 70, def: 73, phy: 69 } },
      { id: 'ogawa_k', name: 'Kyogo Furuhashi', pos: 'ST', ovr: 79, stats: { pac: 87, sho: 80, pas: 62, dri: 78, def: 30, phy: 65 } },
      { id: 'kimura_h', name: 'Hiroki Sakai2', pos: 'CB', ovr: 74, stats: { pac: 65, sho: 37, pas: 64, dri: 57, def: 77, phy: 78 } },
      { id: 'yamaguchi_m', name: 'Miku Ogawa', pos: 'LW', ovr: 73, stats: { pac: 84, sho: 65, pas: 67, dri: 77, def: 28, phy: 55 } },
      { id: 'ono_y', name: 'Yosuke Ideguchi', pos: 'CM', ovr: 75, stats: { pac: 71, sho: 67, pas: 77, dri: 75, def: 61, phy: 65 } },
      { id: 'sasaki_s', name: 'Sotaro Yasuoka', pos: 'LB', ovr: 71, stats: { pac: 75, sho: 43, pas: 66, dri: 65, def: 70, phy: 64 } },
      { id: 'muroya_s', name: 'Shion Homma', pos: 'CAM', ovr: 74, stats: { pac: 73, sho: 72, pas: 76, dri: 78, def: 39, phy: 55 } },

      { id: 'kikuchi_r', name: 'Ryosuke Kikuchi', pos: 'GK', ovr: 65, stats: { div: 63, han: 62, kic: 53, ref: 66, spd: 31, pos: 65 } },
      { id: 'nishikawa_a', name: 'Andres Iniesta Jr', pos: 'CAM', ovr: 71, stats: { pac: 55, sho: 65, pas: 74, dri: 73, def: 40, phy: 48 } }
    ]
  },
  {
    id: 'yokohama_marinos',
    name: 'Yokohama F. Marinos',
    logo: '🔵⚪',
    squad: [
      { id: 'kojima_h', name: 'Hiroto Nakayama', pos: 'GK', ovr: 73, stats: { div: 73, han: 71, kic: 62, ref: 75, spd: 35, pos: 73 } },
      { id: 'kitagawa_k', name: 'Kota Watanabe', pos: 'RB', ovr: 72, stats: { pac: 76, sho: 44, pas: 66, dri: 65, def: 70, phy: 66 } },
      { id: 'chong_e', name: 'Eduardo Chong', pos: 'CB', ovr: 74, stats: { pac: 65, sho: 37, pas: 64, dri: 57, def: 77, phy: 78 } },
      { id: 'kato_s', name: 'Shinnosuke Nakayama', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 36, pas: 62, dri: 55, def: 76, phy: 76 } },
      { id: 'ueda_a', name: 'Anderson Lopes', pos: 'ST', ovr: 78, stats: { pac: 76, sho: 79, pas: 60, dri: 74, def: 32, phy: 79 } },
      { id: 'iwasaki_y', name: 'Yan Matheus', pos: 'RW', ovr: 76, stats: { pac: 88, sho: 68, pas: 66, dri: 79, def: 27, phy: 58 } },
      { id: 'iwata_j', name: 'Joel Chima Fujita', pos: 'CM', ovr: 76, stats: { pac: 73, sho: 68, pas: 78, dri: 76, def: 62, phy: 66 } },
      { id: 'kim_kyung_won', name: 'Kyung-won Kim', pos: 'LB', ovr: 71, stats: { pac: 74, sho: 42, pas: 65, dri: 64, def: 69, phy: 63 } },
      { id: 'nakamura_k', name: 'Kota Watanabe2', pos: 'CDM', ovr: 74, stats: { pac: 64, sho: 55, pas: 73, dri: 67, def: 76, phy: 72 } },
      { id: 'elber', name: 'Elber', pos: 'ST', ovr: 75, stats: { pac: 83, sho: 74, pas: 58, dri: 76, def: 26, phy: 68 } },
      { id: 'watanabe_r', name: 'Riku Danzaki', pos: 'LW', ovr: 73, stats: { pac: 82, sho: 64, pas: 67, dri: 76, def: 27, phy: 54 } },

      { id: 'oshima_k', name: 'Kosei Yamada', pos: 'GK', ovr: 64, stats: { div: 62, han: 61, kic: 52, ref: 65, spd: 30, pos: 64 } },
      { id: 'watanabe_h', name: 'Hayate Matsuda', pos: 'CM', ovr: 69, stats: { pac: 65, sho: 60, pas: 70, dri: 67, def: 57, phy: 60 } }
    ]
  },
  {
    id: 'sanfrecce_hiroshima',
    name: 'Sanfrecce Hiroshima',
    logo: '🟣⚪',
    squad: [
      { id: 'ono_t', name: 'Taishi Ono', pos: 'GK', ovr: 72, stats: { div: 72, han: 70, kic: 61, ref: 74, spd: 34, pos: 72 } },
      { id: 'nakano_t', name: 'Toshiya Tanaka', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 43, pas: 65, dri: 64, def: 69, phy: 65 } },
      { id: 'sasaki_s2', name: 'Sho Sasaki', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 36, pas: 63, dri: 55, def: 76, phy: 77 } },
      { id: 'nakano_r', name: 'Ryotaro Araki', pos: 'CM', ovr: 75, stats: { pac: 74, sho: 69, pas: 78, dri: 78, def: 60, phy: 63 } },
      { id: 'kimura_t', name: 'Tsukasa Shiotani', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 35, pas: 62, dri: 54, def: 75, phy: 75 } },
      { id: 'nakano_d', name: 'Douglas Vieira', pos: 'ST', ovr: 76, stats: { pac: 74, sho: 78, pas: 58, dri: 73, def: 29, phy: 76 } },
      { id: 'kimura_s', name: 'Sho Sasaki2', pos: 'LW', ovr: 73, stats: { pac: 83, sho: 64, pas: 66, dri: 76, def: 27, phy: 54 } },
      { id: 'nakano_h', name: 'Hiroki Fujiharu', pos: 'LB', ovr: 71, stats: { pac: 76, sho: 42, pas: 64, dri: 65, def: 68, phy: 63 } },
      { id: 'nakano_k', name: 'Kosei Tani', pos: 'CDM', ovr: 72, stats: { pac: 63, sho: 53, pas: 71, dri: 65, def: 74, phy: 70 } },
      { id: 'nakano_s', name: 'Sho Fujimoto', pos: 'RW', ovr: 72, stats: { pac: 82, sho: 63, pas: 65, dri: 75, def: 26, phy: 53 } },
      { id: 'nakano_j', name: 'Jyunya Ito', pos: 'ST', ovr: 74, stats: { pac: 85, sho: 74, pas: 59, dri: 76, def: 25, phy: 63 } },

      { id: 'oosako_r', name: 'Ryota Nagaki', pos: 'GK', ovr: 63, stats: { div: 61, han: 60, kic: 51, ref: 64, spd: 29, pos: 63 } },
      { id: 'kimura_a', name: 'Aoto Kanaya', pos: 'CM', ovr: 68, stats: { pac: 64, sho: 58, pas: 69, dri: 66, def: 55, phy: 59 } }
    ]
  },
  {
    id: 'gamba_osaka',
    name: 'Gamba Osaka',
    logo: '🔵⚫',
    squad: [
      { id: 'higashiguchi_m', name: 'Masaaki Higashiguchi', pos: 'GK', ovr: 77, stats: { div: 77, han: 75, kic: 66, ref: 79, spd: 37, pos: 77 } },
      { id: 'genta_m', name: 'Genta Miura', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 37, pas: 63, dri: 56, def: 77, phy: 78 } },
      { id: 'ushiwaka_h', name: 'Hiroaki Okuno', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 43, pas: 65, dri: 64, def: 69, phy: 65 } },
      { id: 'usami_t', name: 'Takashi Usami', pos: 'RW', ovr: 76, stats: { pac: 84, sho: 74, pas: 71, dri: 79, def: 30, phy: 60 } },
      { id: 'nakano_j2', name: 'Jesus Jimenez', pos: 'ST', ovr: 74, stats: { pac: 73, sho: 76, pas: 58, dri: 72, def: 28, phy: 72 } },
      { id: 'yatsuda_r', name: 'Ryu Takao', pos: 'CM', ovr: 73, stats: { pac: 69, sho: 65, pas: 75, dri: 73, def: 59, phy: 62 } },
      { id: 'kimura_r', name: 'Rei Hirakawa', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 35, pas: 62, dri: 54, def: 75, phy: 75 } },
      { id: 'akiyama_t', name: 'Tomoki Iwata', pos: 'CDM', ovr: 74, stats: { pac: 63, sho: 54, pas: 72, dri: 66, def: 76, phy: 71 } },
      { id: 'sano_k', name: 'Kohei Sano', pos: 'LB', ovr: 70, stats: { pac: 74, sho: 41, pas: 63, dri: 63, def: 67, phy: 62 } },
      { id: 'nakano_y', name: 'Yosuke Fukui', pos: 'LW', ovr: 71, stats: { pac: 81, sho: 62, pas: 64, dri: 74, def: 26, phy: 52 } },
      { id: 'akiyama_h', name: 'Hiroshi Ibusuki', pos: 'ST', ovr: 73, stats: { pac: 77, sho: 72, pas: 57, dri: 70, def: 27, phy: 68 } },

      { id: 'higashiguchi_s', name: 'Shunta Sato', pos: 'GK', ovr: 63, stats: { div: 61, han: 60, kic: 51, ref: 64, spd: 29, pos: 63 } },
      { id: 'akiyama_r', name: 'Ryosuke Yamanaka', pos: 'CM', ovr: 67, stats: { pac: 63, sho: 57, pas: 68, dri: 65, def: 54, phy: 58 } }
    ]
  },
  {
    id: 'ulsan_hd',
    name: 'Ulsan HD',
    logo: '🟠🔵',
    squad: [
      { id: 'jo_hyeon_woo', name: 'Hyeon-Woo Jo', pos: 'GK', ovr: 78, stats: { div: 78, han: 76, kic: 68, ref: 80, spd: 38, pos: 78 } },
      { id: 'seol_young_woo', name: 'Young-Woo Seol', pos: 'RB', ovr: 74, stats: { pac: 77, sho: 46, pas: 68, dri: 67, def: 73, phy: 68 } },
      { id: 'kim_gee_hee', name: 'Gee-Hee Kim', pos: 'CB', ovr: 75, stats: { pac: 65, sho: 38, pas: 64, dri: 57, def: 78, phy: 80 } },
      { id: 'kim_young_gwon', name: 'Young-Gwon Kim', pos: 'CB', ovr: 76, stats: { pac: 66, sho: 39, pas: 66, dri: 58, def: 79, phy: 81 } },
      { id: 'setoguchi_d', name: 'Da-Reun Yoon', pos: 'LB', ovr: 72, stats: { pac: 76, sho: 44, pas: 66, dri: 66, def: 70, phy: 65 } },
      { id: 'lee_chung_yong', name: 'Chung-Yong Lee', pos: 'RW', ovr: 74, stats: { pac: 82, sho: 68, pas: 74, dri: 79, def: 32, phy: 56 } },
      { id: 'won_du_jae', name: 'Du-Jae Won', pos: 'CM', ovr: 75, stats: { pac: 71, sho: 68, pas: 78, dri: 76, def: 62, phy: 65 } },
      { id: 'bojan_l', name: 'Bojan Linta', pos: 'ST', ovr: 78, stats: { pac: 74, sho: 80, pas: 62, dri: 76, def: 30, phy: 78 } },
      { id: 'um_won_sang', name: 'Won-Sang Um', pos: 'ST', ovr: 75, stats: { pac: 78, sho: 76, pas: 60, dri: 74, def: 29, phy: 73 } },
      { id: 'lee_gyu_sung', name: 'Gyu-Sung Lee', pos: 'CAM', ovr: 74, stats: { pac: 72, sho: 71, pas: 76, dri: 78, def: 40, phy: 56 } },
      { id: 'yoon_jong_gyu', name: 'Jong-Gyu Yoon', pos: 'CDM', ovr: 73, stats: { pac: 64, sho: 55, pas: 73, dri: 66, def: 76, phy: 72 } },

      { id: 'jo_su_hyeok', name: 'Su-Hyeok Cho', pos: 'GK', ovr: 66, stats: { div: 64, han: 63, kic: 54, ref: 67, spd: 32, pos: 66 } },
      { id: 'oh_han_min', name: 'Han-Min Oh', pos: 'LW', ovr: 71, stats: { pac: 83, sho: 63, pas: 65, dri: 75, def: 27, phy: 53 } }
    ]
  },
  {
    id: 'pohang_steelers',
    name: 'Pohang Steelers',
    logo: '🔴⚫',
    squad: [
      { id: 'kang_hyun_moo', name: 'Hyun-Moo Kang', pos: 'GK', ovr: 75, stats: { div: 75, han: 73, kic: 64, ref: 77, spd: 36, pos: 75 } },
      { id: 'shin_kwang_hoon', name: 'Kwang-Hoon Shin', pos: 'RB', ovr: 72, stats: { pac: 76, sho: 44, pas: 66, dri: 65, def: 70, phy: 66 } },
      { id: 'kwon_wan_kyu', name: 'Wan-Kyu Kwon', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 37, pas: 63, dri: 56, def: 77, phy: 79 } },
      { id: 'gureje_hong', name: 'Yun-Sang Hong', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 35, pas: 62, dri: 54, def: 75, phy: 76 } },
      { id: 'yu_sang_hoon', name: 'Sang-Hoon Yu', pos: 'CM', ovr: 76, stats: { pac: 72, sho: 71, pas: 79, dri: 77, def: 62, phy: 65 } },
      { id: 'jung_jae_hee', name: 'Jae-Hee Jung', pos: 'CAM', ovr: 77, stats: { pac: 73, sho: 76, pas: 80, dri: 81, def: 41, phy: 58 } },
      { id: 'wan_jun_hyeok', name: 'Jun-Hyeok Wan', pos: 'LB', ovr: 71, stats: { pac: 75, sho: 42, pas: 64, dri: 64, def: 69, phy: 63 } },
      { id: 'gustavo_c', name: 'Gustavo Campanharo', pos: 'CDM', ovr: 76, stats: { pac: 66, sho: 58, pas: 76, dri: 71, def: 78, phy: 74 } },
      { id: 'jeong_jae_hui', name: 'Jae-Hui Jeong', pos: 'ST', ovr: 76, stats: { pac: 76, sho: 78, pas: 60, dri: 74, def: 29, phy: 74 } },
      { id: 'shin_gwang_hun', name: 'Kwang-Hun Shin2', pos: 'RW', ovr: 73, stats: { pac: 84, sho: 64, pas: 67, dri: 77, def: 27, phy: 54 } },
      { id: 'ha_chang_rae', name: 'Chang-Rae Ha', pos: 'LW', ovr: 72, stats: { pac: 82, sho: 63, pas: 66, dri: 75, def: 26, phy: 53 } },

      { id: 'jeon_jun_hyeok', name: 'Jun-Hyeok Jeon', pos: 'GK', ovr: 64, stats: { div: 62, han: 61, kic: 52, ref: 65, spd: 30, pos: 64 } },
      { id: 'jung_hyun_chul', name: 'Hyun-Chul Jung', pos: 'CM', ovr: 69, stats: { pac: 65, sho: 60, pas: 70, dri: 67, def: 57, phy: 60 } }
    ]
  },
  {
    id: 'jeonbuk_hyundai',
    name: 'Jeonbuk Hyundai Motors',
    logo: '🟢⚫',
    squad: [
      { id: 'jung_min_ki', name: 'Min-Ki Jung', pos: 'GK', ovr: 76, stats: { div: 76, han: 74, kic: 65, ref: 78, spd: 37, pos: 76 } },
      { id: 'kim_moon_hwan', name: 'Moon-Hwan Kim', pos: 'RB', ovr: 74, stats: { pac: 78, sho: 46, pas: 69, dri: 67, def: 72, phy: 68 } },
      { id: 'park_jin_seob', name: 'Jin-Seob Park', pos: 'CB', ovr: 75, stats: { pac: 65, sho: 38, pas: 64, dri: 57, def: 78, phy: 80 } },
      { id: 'kim_jin_su', name: 'Jin-Su Kim', pos: 'LB', ovr: 76, stats: { pac: 80, sho: 47, pas: 71, dri: 70, def: 73, phy: 69 }, altPos: ['LW'] },
      { id: 'baek_seung_ho', name: 'Seung-Ho Baek', pos: 'CM', ovr: 78, stats: { pac: 71, sho: 71, pas: 80, dri: 78, def: 64, phy: 67 } },
      { id: 'song_min_kyu', name: 'Min-Kyu Song', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 36, pas: 62, dri: 55, def: 76, phy: 77 } },
      { id: 'chun_hyeon_min', name: 'Hyeon-Min Chun', pos: 'ST', ovr: 76, stats: { pac: 76, sho: 78, pas: 61, dri: 74, def: 29, phy: 73 } },
      { id: 'ilbey_e', name: 'Ilbey Erdal', pos: 'RW', ovr: 74, stats: { pac: 85, sho: 67, pas: 68, dri: 78, def: 28, phy: 55 } },
      { id: 'lee_seung_gi', name: 'Seung-Gi Lee', pos: 'CAM', ovr: 75, stats: { pac: 72, sho: 73, pas: 78, dri: 79, def: 40, phy: 57 } },
      { id: 'bo_koung', name: 'Bo-Kyung Kim', pos: 'CDM', ovr: 74, stats: { pac: 64, sho: 55, pas: 73, dri: 67, def: 77, phy: 73 } },
      { id: 'kwon_hyeok_gyu', name: 'Hyeok-Gyu Kwon', pos: 'LW', ovr: 72, stats: { pac: 82, sho: 63, pas: 66, dri: 75, def: 26, phy: 53 } },

      { id: 'kim_jung_hoon', name: 'Jung-Hoon Kim', pos: 'GK', ovr: 65, stats: { div: 63, han: 62, kic: 53, ref: 66, spd: 31, pos: 65 } },
      { id: 'han_kyo_won', name: 'Kyo-Won Han', pos: 'CM', ovr: 69, stats: { pac: 65, sho: 60, pas: 70, dri: 67, def: 57, phy: 60 } }
    ]
  },
  {
    id: 'fc_seoul',
    name: 'FC Seoul',
    logo: '🔴⚫',
    squad: [
      { id: 'baek_jong_beom', name: 'Jong-Beom Baek', pos: 'GK', ovr: 73, stats: { div: 73, han: 71, kic: 62, ref: 75, spd: 35, pos: 73 } },
      { id: 'kim_ju_sung', name: 'Ju-Sung Kim', pos: 'CB', ovr: 74, stats: { pac: 65, sho: 37, pas: 63, dri: 56, def: 77, phy: 79 } },
      { id: 'lee_han_beom', name: 'Han-Beom Lee', pos: 'RB', ovr: 72, stats: { pac: 76, sho: 44, pas: 66, dri: 65, def: 70, phy: 66 } },
      { id: 'osmar_i', name: 'Osmar Ibanez', pos: 'CDM', ovr: 76, stats: { pac: 64, sho: 56, pas: 75, dri: 69, def: 78, phy: 76 } },
      { id: 'kim_won_shik', name: 'Won-Shik Kim', pos: 'CM', ovr: 74, stats: { pac: 70, sho: 66, pas: 76, dri: 74, def: 60, phy: 63 } },
      { id: 'anderson_a', name: 'Anderson Oliveira', pos: 'ST', ovr: 76, stats: { pac: 74, sho: 78, pas: 59, dri: 73, def: 28, phy: 75 } },
      { id: 'jung_seung_won', name: 'Seung-Won Jung', pos: 'RW', ovr: 73, stats: { pac: 83, sho: 65, pas: 67, dri: 76, def: 27, phy: 54 } },
      { id: 'yoon_jong_gyu2', name: 'Kang-Hyun Yang', pos: 'LB', ovr: 71, stats: { pac: 75, sho: 42, pas: 64, dri: 64, def: 69, phy: 63 } },
      { id: 'kim_kyung_min', name: 'Kyung-Min Kim', pos: 'LW', ovr: 72, stats: { pac: 82, sho: 63, pas: 65, dri: 75, def: 26, phy: 53 } },
      { id: 'palacios_c', name: 'Carlos Palacios', pos: 'CAM', ovr: 76, stats: { pac: 74, sho: 74, pas: 79, dri: 81, def: 38, phy: 58 } },
      { id: 'go_yohan', name: 'Yo-Han Go', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 34, pas: 60, dri: 53, def: 74, phy: 75 } },

      { id: 'yang_han_bin', name: 'Han-Bin Yang', pos: 'GK', ovr: 63, stats: { div: 61, han: 60, kic: 51, ref: 64, spd: 29, pos: 63 } },
      { id: 'lee_ki_je', name: 'Ki-Je Lee', pos: 'ST', ovr: 69, stats: { pac: 76, sho: 69, pas: 54, dri: 68, def: 25, phy: 63 } }
    ]
  },
  {
    id: 'gangwon_fc',
    name: 'Gangwon FC',
    logo: '🟠⚫',
    squad: [
      { id: 'yu_hyun', name: 'Hyun Yu', pos: 'GK', ovr: 72, stats: { div: 72, han: 70, kic: 61, ref: 74, spd: 34, pos: 72 } },
      { id: 'kim_yeong_gwang', name: 'Yeong-Gwang Kim', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 43, pas: 65, dri: 64, def: 69, phy: 65 } },
      { id: 'kim_dae_won', name: 'Dae-Won Kim', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 35, pas: 62, dri: 54, def: 75, phy: 76 } },
      { id: 'yang_min_hyeok', name: 'Min-Hyeok Yang', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 34, pas: 61, dri: 53, def: 74, phy: 74 } },
      { id: 'kim_dae_ho', name: 'Dae-Ho Kim', pos: 'CM', ovr: 73, stats: { pac: 69, sho: 65, pas: 75, dri: 73, def: 59, phy: 62 } },
      { id: 'yang_hyun_jun', name: 'Hyun-Jun Yang', pos: 'RW', ovr: 75, stats: { pac: 88, sho: 67, pas: 69, dri: 80, def: 27, phy: 55 } },
      { id: 'kim_jin_ho', name: 'Jin-Ho Kim', pos: 'LB', ovr: 70, stats: { pac: 74, sho: 41, pas: 63, dri: 63, def: 68, phy: 62 } },
      { id: 'valeri_q', name: 'Valeri Qazaishvili', pos: 'CAM', ovr: 75, stats: { pac: 76, sho: 73, pas: 77, dri: 80, def: 36, phy: 58 } },
      { id: 'yang_yong_woo', name: 'Yong-Woo Yang', pos: 'ST', ovr: 74, stats: { pac: 76, sho: 75, pas: 58, dri: 72, def: 27, phy: 71 } },
      { id: 'idejima_h', name: 'Ihyeon Kim', pos: 'CDM', ovr: 71, stats: { pac: 61, sho: 52, pas: 70, dri: 64, def: 74, phy: 69 } },
      { id: 'jung_seung_yong', name: 'Seung-Yong Jung', pos: 'LW', ovr: 72, stats: { pac: 82, sho: 62, pas: 64, dri: 75, def: 26, phy: 52 } },

      { id: 'kim_hak_bin', name: 'Hak-Bin Kim', pos: 'GK', ovr: 61, stats: { div: 59, han: 58, kic: 49, ref: 62, spd: 27, pos: 61 } },
      { id: 'lee_geon', name: 'Geon Lee', pos: 'ST', ovr: 68, stats: { pac: 74, sho: 67, pas: 53, dri: 66, def: 24, phy: 61 } }
    ]
  },
  {
    id: 'al_sadd',
    name: 'Al Sadd',
    logo: '⚫⚪',
    squad: [
      { id: 'saad_al_sheeb', name: 'Saad Al-Sheeb', pos: 'GK', ovr: 76, stats: { div: 76, han: 74, kic: 65, ref: 78, spd: 37, pos: 76 } },
      { id: 'pedro_miguel', name: 'Pedro Miguel', pos: 'CB', ovr: 76, stats: { pac: 66, sho: 38, pas: 65, dri: 58, def: 79, phy: 80 } },
      { id: 'boudiaf_k', name: 'Karim Boudiaf', pos: 'CDM', ovr: 76, stats: { pac: 65, sho: 57, pas: 76, dri: 70, def: 78, phy: 75 } },
      { id: 'al_haydos_h', name: 'Hassan Al-Haydos', pos: 'CAM', ovr: 79, stats: { pac: 73, sho: 76, pas: 80, dri: 81, def: 40, phy: 60 } },
      { id: 'santi_cazorla', name: 'Santi Cazorla', pos: 'CM', ovr: 79, stats: { pac: 62, sho: 76, pas: 84, dri: 82, def: 55, phy: 58 } },
      { id: 'akram_afif', name: 'Akram Afif', pos: 'RW', ovr: 82, stats: { pac: 81, sho: 79, pas: 82, dri: 85, def: 32, phy: 58 } },
      { id: 'baghdad_b2', name: 'Michael Olunga', pos: 'ST', ovr: 79, stats: { pac: 80, sho: 82, pas: 60, dri: 76, def: 30, phy: 82 } },
      { id: 'al_rawi_a', name: 'Abdulkarim Al-Rawi', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 36, pas: 62, dri: 55, def: 76, phy: 77 } },
      { id: 'al_moez_a', name: 'Ali Al-Moez', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 44, pas: 65, dri: 64, def: 70, phy: 65 } },
      { id: 'al_rawi_b', name: 'Bassam Al-Rawi', pos: 'LB', ovr: 72, stats: { pac: 76, sho: 45, pas: 66, dri: 66, def: 71, phy: 66 } },
      { id: 'guilherme_t', name: 'Guilherme Torres', pos: 'LW', ovr: 76, stats: { pac: 84, sho: 71, pas: 71, dri: 80, def: 29, phy: 60 } },

      { id: 'meshaal_b', name: 'Meshaal Barsham', pos: 'GK', ovr: 66, stats: { div: 64, han: 63, kic: 54, ref: 67, spd: 32, pos: 66 } },
      { id: 'tarek_s', name: 'Tarek Salman', pos: 'CB', ovr: 70, stats: { pac: 60, sho: 33, pas: 60, dri: 52, def: 73, phy: 74 } }
    ]
  },
  {
    id: 'al_duhail',
    name: 'Al Duhail',
    logo: '🟡🔵',
    squad: [
      { id: 'mesaad_al_shammari', name: 'Mesaad Al-Shammari', pos: 'GK', ovr: 74, stats: { div: 74, han: 72, kic: 63, ref: 76, spd: 36, pos: 74 } },
      { id: 'josh_cavallo', name: 'Boualem Khoukhi', pos: 'CB', ovr: 75, stats: { pac: 65, sho: 37, pas: 64, dri: 57, def: 78, phy: 79 } },
      { id: 'lucas_mendes', name: 'Lucas Mendes', pos: 'CB', ovr: 76, stats: { pac: 68, sho: 38, pas: 65, dri: 58, def: 79, phy: 81 } },
      { id: 'edmilson_j', name: 'Edmilson Junior', pos: 'ST', ovr: 76, stats: { pac: 76, sho: 78, pas: 60, dri: 74, def: 29, phy: 74 } },
      { id: 'almoez_ali', name: 'Almoez Ali', pos: 'ST', ovr: 79, stats: { pac: 82, sho: 80, pas: 62, dri: 76, def: 31, phy: 76 } },
      { id: 'roger_guedes', name: 'Roger Guedes', pos: 'LW', ovr: 79, stats: { pac: 84, sho: 79, pas: 74, dri: 82, def: 30, phy: 64 } },
      { id: 'ahmed_fathy', name: 'Ahmed Fathi', pos: 'RB', ovr: 72, stats: { pac: 75, sho: 44, pas: 66, dri: 64, def: 71, phy: 66 } },
      { id: 'mario_mandzukic_jr', name: 'Michael Nkamba', pos: 'CM', ovr: 74, stats: { pac: 70, sho: 66, pas: 76, dri: 74, def: 60, phy: 63 } },
      { id: 'karim_boudiaf2', name: 'Assim Madibo', pos: 'CDM', ovr: 75, stats: { pac: 64, sho: 55, pas: 74, dri: 68, def: 77, phy: 74 } },
      { id: 'tameem_a', name: 'Tameem Al-Muhaza', pos: 'LB', ovr: 71, stats: { pac: 74, sho: 42, pas: 64, dri: 63, def: 69, phy: 63 } },
      { id: 'hisham_f', name: 'Hisham Faraj', pos: 'RW', ovr: 73, stats: { pac: 82, sho: 65, pas: 67, dri: 76, def: 27, phy: 55 } },

      { id: 'saad_a', name: 'Saad Al-Sheeb2', pos: 'GK', ovr: 64, stats: { div: 62, han: 61, kic: 52, ref: 65, spd: 30, pos: 64 } },
      { id: 'ismail_m', name: 'Ismail Mohammad', pos: 'CM', ovr: 68, stats: { pac: 64, sho: 58, pas: 69, dri: 66, def: 55, phy: 59 } }
    ]
  },
  {
    id: 'al_rayyan',
    name: 'Al Rayyan',
    logo: '⚪🔴',
    squad: [
      { id: 'yousuf_h', name: 'Yousuf Hassan', pos: 'GK', ovr: 71, stats: { div: 71, han: 69, kic: 60, ref: 73, spd: 34, pos: 71 } },
      { id: 'mady_camara', name: 'Mady Camara', pos: 'CDM', ovr: 76, stats: { pac: 68, sho: 58, pas: 76, dri: 71, def: 79, phy: 76 } },
      { id: 'yacine_brahimi', name: 'Yacine Brahimi', pos: 'CAM', ovr: 78, stats: { pac: 72, sho: 75, pas: 79, dri: 82, def: 38, phy: 58 } },
      { id: 'omar_al_somah2', name: 'Serginho', pos: 'ST', ovr: 75, stats: { pac: 78, sho: 76, pas: 59, dri: 73, def: 28, phy: 71 } },
      { id: 'bilal_r', name: 'Bilal Rajab', pos: 'CB', ovr: 71, stats: { pac: 62, sho: 35, pas: 61, dri: 54, def: 74, phy: 75 } },
      { id: 'ahmed_moein', name: 'Ahmed Moein', pos: 'RW', ovr: 73, stats: { pac: 82, sho: 64, pas: 66, dri: 76, def: 27, phy: 54 } },
      { id: 'ro_ro', name: 'Rodrigo Pardal', pos: 'CB', ovr: 72, stats: { pac: 61, sho: 34, pas: 60, dri: 53, def: 75, phy: 76 } },
      { id: 'abdelkarim_h', name: 'Abdelkarim Hassan', pos: 'LB', ovr: 74, stats: { pac: 78, sho: 46, pas: 68, dri: 67, def: 72, phy: 67 } },
      { id: 'khalid_muneer', name: 'Khalid Muneer', pos: 'RB', ovr: 70, stats: { pac: 73, sho: 42, pas: 63, dri: 62, def: 68, phy: 63 } },
      { id: 'ibrahim_al_ahmed', name: 'Ibrahim Al-Ahmed', pos: 'CM', ovr: 71, stats: { pac: 66, sho: 62, pas: 71, dri: 68, def: 57, phy: 60 } },
      { id: 'moataz_h', name: 'Moataz Hisham', pos: 'LW', ovr: 71, stats: { pac: 81, sho: 62, pas: 64, dri: 74, def: 26, phy: 52 } },

      { id: 'saoud_a', name: 'Saoud Al-Khater', pos: 'GK', ovr: 61, stats: { div: 59, han: 58, kic: 49, ref: 62, spd: 27, pos: 61 } },
      { id: 'jassim_j', name: 'Jassim Jabir', pos: 'ST', ovr: 67, stats: { pac: 73, sho: 66, pas: 52, dri: 65, def: 23, phy: 60 } }
    ]
  },
  {
    id: 'al_gharafa',
    name: 'Al Gharafa',
    logo: '🟠⚪',
    squad: [
      { id: 'abdullah_al_yazidi', name: 'Abdullah Al-Yazidi', pos: 'GK', ovr: 70, stats: { div: 70, han: 68, kic: 59, ref: 72, spd: 33, pos: 70 } },
      { id: 'mostafa_m', name: 'Mostafa Mohamed', pos: 'ST', ovr: 77, stats: { pac: 79, sho: 79, pas: 60, dri: 75, def: 28, phy: 75 } },
      { id: 'ryan_hedges', name: 'Ryan Hedges', pos: 'LW', ovr: 75, stats: { pac: 82, sho: 68, pas: 71, dri: 78, def: 30, phy: 58 } },
      { id: 'ahmed_al_rawi', name: 'Ahmed Al-Rawi', pos: 'CB', ovr: 70, stats: { pac: 60, sho: 33, pas: 60, dri: 52, def: 73, phy: 74 } },
      { id: 'ahmed_yasser', name: 'Ahmed Yasser', pos: 'RB', ovr: 69, stats: { pac: 72, sho: 41, pas: 62, dri: 61, def: 67, phy: 62 } },
      { id: 'khoder_e', name: 'Khoder El Zein', pos: 'CM', ovr: 71, stats: { pac: 66, sho: 62, pas: 71, dri: 68, def: 57, phy: 60 } },
      { id: 'ahmed_alaaeldin', name: 'Ahmed Alaaeldin', pos: 'CAM', ovr: 73, stats: { pac: 70, sho: 69, pas: 74, dri: 76, def: 36, phy: 52 } },
      { id: 'abdulaziz_h', name: 'Abdulaziz Hatem', pos: 'RW', ovr: 74, stats: { pac: 82, sho: 66, pas: 70, dri: 78, def: 28, phy: 55 } },
      { id: 'yousef_a', name: 'Yousef Ayman', pos: 'CB', ovr: 69, stats: { pac: 59, sho: 32, pas: 59, dri: 51, def: 72, phy: 72 } },
      { id: 'mohammed_w', name: 'Mohammed Waad', pos: 'LB', ovr: 68, stats: { pac: 71, sho: 40, pas: 61, dri: 60, def: 66, phy: 61 } },
      { id: 'thiago_n', name: 'Thiago Neves', pos: 'CDM', ovr: 71, stats: { pac: 61, sho: 52, pas: 70, dri: 64, def: 74, phy: 69 } },

      { id: 'saeed_a2', name: 'Saeed Al-Emadi', pos: 'GK', ovr: 60, stats: { div: 58, han: 57, kic: 48, ref: 61, spd: 26, pos: 60 } },
      { id: 'khalid_e', name: 'Khalid Emhamed', pos: 'ST', ovr: 66, stats: { pac: 72, sho: 65, pas: 51, dri: 64, def: 22, phy: 59 } }
    ]
  },
  {
    id: 'al_ain',
    name: 'Al Ain',
    logo: '🟡🔴',
    squad: [
      { id: 'khalid_eisa', name: 'Khalid Eisa', pos: 'GK', ovr: 76, stats: { div: 76, han: 74, kic: 65, ref: 78, spd: 37, pos: 76 } },
      { id: 'yahia_nader', name: 'Yahia Nader', pos: 'RB', ovr: 73, stats: { pac: 76, sho: 45, pas: 67, dri: 66, def: 71, phy: 67 } },
      { id: 'kodjo_laba', name: 'Kodjo Laba', pos: 'CB', ovr: 75, stats: { pac: 66, sho: 38, pas: 65, dri: 58, def: 78, phy: 80 } },
      { id: 'nikola_v', name: 'Nikola Vukcevic', pos: 'CDM', ovr: 77, stats: { pac: 66, sho: 60, pas: 77, dri: 71, def: 79, phy: 76 } },
      { id: 'soufiane_r', name: 'Soufiane Rahimi', pos: 'ST', ovr: 81, stats: { pac: 81, sho: 83, pas: 66, dri: 79, def: 32, phy: 74 } },
      { id: 'kaku_p', name: 'Ivan Franjic', pos: 'LB', ovr: 71, stats: { pac: 76, sho: 44, pas: 66, dri: 66, def: 70, phy: 65 } },
      { id: 'yahya_al_ghassani', name: 'Yahya Al-Ghassani', pos: 'RW', ovr: 74, stats: { pac: 85, sho: 67, pas: 68, dri: 78, def: 27, phy: 55 } },
      { id: 'matheus_p', name: 'Matheus Pereira', pos: 'CAM', ovr: 80, stats: { pac: 76, sho: 77, pas: 82, dri: 84, def: 40, phy: 60 } },
      { id: 'caio_c', name: 'Caio Canedo', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 36, pas: 62, dri: 55, def: 76, phy: 77 } },
      { id: 'jonathan_k', name: 'Jonathan Kodjia', pos: 'ST', ovr: 76, stats: { pac: 78, sho: 78, pas: 60, dri: 75, def: 29, phy: 73 } },
      { id: 'abdalla_h', name: 'Abdalla Hamdan', pos: 'CM', ovr: 71, stats: { pac: 67, sho: 62, pas: 71, dri: 69, def: 58, phy: 61 } },

      { id: 'ali_khaseif', name: 'Ali Khaseif', pos: 'GK', ovr: 68, stats: { div: 66, han: 65, kic: 56, ref: 69, spd: 33, pos: 68 } },
      { id: 'ahmed_barman', name: 'Ahmed Barman', pos: 'LW', ovr: 71, stats: { pac: 82, sho: 62, pas: 65, dri: 74, def: 26, phy: 52 } }
    ]
  },
  {
    id: 'al_wahda',
    name: 'Al Wahda',
    logo: '⚫🟡',
    squad: [
      { id: 'majed_naser', name: 'Majed Naser', pos: 'GK', ovr: 73, stats: { div: 73, han: 71, kic: 62, ref: 75, spd: 35, pos: 73 } },
      { id: 'igor_coronado2', name: 'Caio Lucas', pos: 'RW', ovr: 76, stats: { pac: 84, sho: 70, pas: 71, dri: 79, def: 29, phy: 58 } },
      { id: 'balint_v', name: 'Balint Vecsei', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 36, pas: 62, dri: 55, def: 76, phy: 77 } },
      { id: 'andre_l', name: 'Andre Luis', pos: 'ST', ovr: 76, stats: { pac: 75, sho: 78, pas: 59, dri: 73, def: 28, phy: 75 } },
      { id: 'khalifa_a', name: 'Khalifa Al-Hammadi', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 43, pas: 65, dri: 64, def: 70, phy: 65 } },
      { id: 'sultan_al_amimi', name: 'Sultan Al-Amimi', pos: 'CM', ovr: 72, stats: { pac: 68, sho: 63, pas: 72, dri: 70, def: 58, phy: 61 } },
      { id: 'yahia_al_ghassani2', name: 'Ali Saleh', pos: 'CAM', ovr: 74, stats: { pac: 71, sho: 71, pas: 76, dri: 78, def: 37, phy: 54 } },
      { id: 'fabio_l', name: 'Fabio Lima', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 34, pas: 60, dri: 53, def: 74, phy: 74 } },
      { id: 'ismail_ahmed', name: 'Ismail Ahmed', pos: 'LB', ovr: 70, stats: { pac: 74, sho: 42, pas: 63, dri: 63, def: 69, phy: 63 } },
      { id: 'saif_r', name: 'Saif Rashid', pos: 'CDM', ovr: 71, stats: { pac: 61, sho: 52, pas: 70, dri: 64, def: 74, phy: 70 } },
      { id: 'ahmed_ali', name: 'Ahmed Ali', pos: 'LW', ovr: 70, stats: { pac: 80, sho: 60, pas: 63, dri: 72, def: 25, phy: 51 } },

      { id: 'ahmed_al_hosani', name: 'Ahmed Al-Hosani', pos: 'GK', ovr: 62, stats: { div: 60, han: 59, kic: 50, ref: 63, spd: 28, pos: 62 } },
      { id: 'salem_r', name: 'Salem Rashid', pos: 'ST', ovr: 67, stats: { pac: 73, sho: 66, pas: 52, dri: 65, def: 23, phy: 60 } }
    ]
  },
  {
    id: 'shabab_al_ahli',
    name: 'Shabab Al Ahli',
    logo: '🔵🔴',
    squad: [
      { id: 'adel_al_hosani', name: 'Adel Al-Hosani', pos: 'GK', ovr: 74, stats: { div: 74, han: 72, kic: 63, ref: 76, spd: 36, pos: 74 } },
      { id: 'fabio_lima2', name: 'Fabio de Lima', pos: 'ST', ovr: 78, stats: { pac: 78, sho: 80, pas: 62, dri: 76, def: 30, phy: 76 } },
      { id: 'walid_azaro', name: 'Walid Azaro', pos: 'ST', ovr: 75, stats: { pac: 77, sho: 76, pas: 58, dri: 73, def: 28, phy: 72 } },
      { id: 'yahya_nader2', name: 'Yahya Nader2', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 43, pas: 65, dri: 64, def: 70, phy: 65 } },
      { id: 'majed_h', name: 'Majed Hassan', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 36, pas: 62, dri: 55, def: 76, phy: 78 } },
      { id: 'erik_f', name: 'Erik Fernando', pos: 'CM', ovr: 74, stats: { pac: 70, sho: 66, pas: 76, dri: 74, def: 60, phy: 63 } },
      { id: 'zayed_sultan', name: 'Zayed Sultan', pos: 'RW', ovr: 74, stats: { pac: 84, sho: 65, pas: 68, dri: 77, def: 27, phy: 55 } },
      { id: 'yahia_al_ghassani3', name: 'Rayan Yaslam', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 34, pas: 60, dri: 53, def: 74, phy: 75 } },
      { id: 'salem_al_shamsi', name: 'Salem Al-Shamsi', pos: 'LB', ovr: 70, stats: { pac: 74, sho: 42, pas: 63, dri: 63, def: 69, phy: 63 } },
      { id: 'jassem_y', name: 'Jassem Yaqoub', pos: 'CDM', ovr: 71, stats: { pac: 61, sho: 52, pas: 70, dri: 64, def: 74, phy: 70 } },
      { id: 'igor_c', name: 'Igor Coronado3', pos: 'CAM', ovr: 77, stats: { pac: 73, sho: 74, pas: 79, dri: 80, def: 38, phy: 56 } },

      { id: 'ali_sabbar', name: 'Ali Sabbar', pos: 'GK', ovr: 63, stats: { div: 61, han: 60, kic: 51, ref: 64, spd: 29, pos: 63 } },
      { id: 'khalfan_m', name: 'Khalfan Mubarak', pos: 'LW', ovr: 76, stats: { pac: 83, sho: 68, pas: 71, dri: 80, def: 28, phy: 56 } }
    ]
  },
  {
    id: 'sharjah_fc',
    name: 'Sharjah FC',
    logo: '🟡🔵',
    squad: [
      { id: 'yousif_e', name: 'Yousif Essa', pos: 'GK', ovr: 71, stats: { div: 71, han: 69, kic: 60, ref: 73, spd: 34, pos: 71 } },
      { id: 'igor_l', name: 'Igor Lichnovsky', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 37, pas: 63, dri: 56, def: 77, phy: 79 } },
      { id: 'bruno_m', name: 'Bruno Mota', pos: 'ST', ovr: 76, stats: { pac: 76, sho: 78, pas: 59, dri: 73, def: 28, phy: 74 } },
      { id: 'caio_l2', name: 'Caio Lucas2', pos: 'RW', ovr: 74, stats: { pac: 83, sho: 65, pas: 67, dri: 77, def: 27, phy: 54 } },
      { id: 'rashed_e', name: 'Rashed Eisa', pos: 'RB', ovr: 70, stats: { pac: 74, sho: 42, pas: 64, dri: 63, def: 69, phy: 63 } },
      { id: 'lucas_c', name: 'Lucas Candido', pos: 'CAM', ovr: 74, stats: { pac: 71, sho: 71, pas: 75, dri: 77, def: 37, phy: 54 } },
      { id: 'majed_s', name: 'Majed Suroor', pos: 'CM', ovr: 71, stats: { pac: 66, sho: 61, pas: 71, dri: 68, def: 57, phy: 60 } },
      { id: 'abdullah_r', name: 'Abdullah Ramadan', pos: 'CB', ovr: 70, stats: { pac: 60, sho: 33, pas: 60, dri: 52, def: 73, phy: 74 } },
      { id: 'khalid_a', name: 'Khalid Al-Hashemi', pos: 'LB', ovr: 69, stats: { pac: 72, sho: 40, pas: 61, dri: 61, def: 66, phy: 61 } },
      { id: 'joaozinho', name: 'Joaozinho', pos: 'CDM', ovr: 71, stats: { pac: 61, sho: 52, pas: 70, dri: 64, def: 74, phy: 69 } },
      { id: 'ahmed_g', name: 'Ahmed Gomaa', pos: 'LW', ovr: 71, stats: { pac: 81, sho: 61, pas: 64, dri: 74, def: 26, phy: 52 } },

      { id: 'adel_r', name: 'Adel Rashed', pos: 'GK', ovr: 60, stats: { div: 58, han: 57, kic: 48, ref: 61, spd: 26, pos: 60 } },
      { id: 'saeed_j', name: 'Saeed Juma', pos: 'ST', ovr: 66, stats: { pac: 72, sho: 65, pas: 51, dri: 64, def: 22, phy: 59 } }
    ]
  },
  {
    id: 'persepolis',
    name: 'Persepolis FC',
    logo: '🔴⚪',
    squad: [
      { id: 'hossein_hosseini', name: 'Hossein Hosseini', pos: 'GK', ovr: 78, stats: { div: 78, han: 76, kic: 68, ref: 80, spd: 38, pos: 78 } },
      { id: 'shoja_khalilzadeh', name: 'Shoja Khalilzadeh', pos: 'CB', ovr: 76, stats: { pac: 66, sho: 39, pas: 65, dri: 58, def: 79, phy: 81 } },
      { id: 'milad_mohammadi', name: 'Milad Mohammadi', pos: 'LB', ovr: 76, stats: { pac: 81, sho: 47, pas: 71, dri: 70, def: 73, phy: 68 } },
      { id: 'siavash_yazdani', name: 'Siavash Yazdani', pos: 'RB', ovr: 73, stats: { pac: 76, sho: 45, pas: 67, dri: 66, def: 71, phy: 67 } },
      { id: 'ahmad_noorollahi', name: 'Ahmad Noorollahi', pos: 'CDM', ovr: 77, stats: { pac: 66, sho: 60, pas: 78, dri: 71, def: 79, phy: 76 } },
      { id: 'issa_alekasir', name: 'Issa Alekasir', pos: 'ST', ovr: 76, stats: { pac: 76, sho: 78, pas: 60, dri: 74, def: 29, phy: 74 } },
      { id: 'ali_alipour', name: 'Ali Alipour', pos: 'ST', ovr: 77, stats: { pac: 78, sho: 79, pas: 61, dri: 75, def: 30, phy: 75 } },
      { id: 'saman_falahatchi', name: 'Saman Falahatchi', pos: 'CAM', ovr: 74, stats: { pac: 72, sho: 71, pas: 76, dri: 78, def: 39, phy: 56 } },
      { id: 'mohammad_naderi', name: 'Mohammad Naderi', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 36, pas: 62, dri: 55, def: 76, phy: 78 } },
      { id: 'sattar_zare', name: 'Sattar Zare', pos: 'CM', ovr: 73, stats: { pac: 69, sho: 65, pas: 75, dri: 73, def: 59, phy: 62 } },
      { id: 'osman_omari', name: 'Osman Omari', pos: 'RW', ovr: 73, stats: { pac: 84, sho: 65, pas: 67, dri: 77, def: 27, phy: 54 } },

      { id: 'seyed_hossein_hosseini', name: 'Seyed Hosseini', pos: 'GK', ovr: 66, stats: { div: 64, han: 63, kic: 54, ref: 67, spd: 32, pos: 66 } },
      { id: 'mehdi_shiri', name: 'Mehdi Shiri', pos: 'CM', ovr: 69, stats: { pac: 65, sho: 60, pas: 70, dri: 67, def: 57, phy: 60 } }
    ]
  },
  {
    id: 'esteghlal',
    name: 'Esteghlal FC',
    logo: '🔵⚪',
    squad: [
      { id: 'seyed_amir_abedzadeh', name: 'Amir Abedzadeh', pos: 'GK', ovr: 77, stats: { div: 77, han: 75, kic: 66, ref: 79, spd: 37, pos: 77 } },
      { id: 'arsalan_motahari', name: 'Arsalan Motahari', pos: 'RB', ovr: 73, stats: { pac: 76, sho: 45, pas: 67, dri: 66, def: 71, phy: 67 } },
      { id: 'rouzbeh_cheshmi', name: 'Rouzbeh Cheshmi', pos: 'CDM', ovr: 77, stats: { pac: 66, sho: 60, pas: 78, dri: 71, def: 79, phy: 76 } },
      { id: 'mehdi_ghayedi', name: 'Mehdi Ghayedi', pos: 'RW', ovr: 76, stats: { pac: 86, sho: 71, pas: 70, dri: 79, def: 28, phy: 58 } },
      { id: 'yasin_salmani', name: 'Yasin Salmani', pos: 'ST', ovr: 74, stats: { pac: 77, sho: 76, pas: 58, dri: 72, def: 28, phy: 71 } },
      { id: 'kaveh_rezaei', name: 'Kaveh Rezaei', pos: 'ST', ovr: 76, stats: { pac: 77, sho: 78, pas: 59, dri: 74, def: 29, phy: 73 } },
      { id: 'sina_khadem', name: 'Sina Khadem', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 36, pas: 62, dri: 55, def: 76, phy: 77 } },
      { id: 'mohammad_daneshgar', name: 'Mohammad Daneshgar', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 35, pas: 61, dri: 54, def: 75, phy: 76 } },
      { id: 'saeid_sadeghi', name: 'Saeid Sadeghi', pos: 'LB', ovr: 71, stats: { pac: 75, sho: 43, pas: 65, dri: 64, def: 70, phy: 65 } },
      { id: 'ali_karimi_jr', name: 'Ali Karimi', pos: 'CAM', ovr: 74, stats: { pac: 71, sho: 71, pas: 76, dri: 78, def: 38, phy: 55 } },
      { id: 'danial_esmaeilifar', name: 'Danial Esmaeilifar', pos: 'CM', ovr: 71, stats: { pac: 66, sho: 61, pas: 71, dri: 68, def: 57, phy: 60 } },

      { id: 'hossein_pourhamidi', name: 'Hossein Pourhamidi', pos: 'GK', ovr: 65, stats: { div: 63, han: 62, kic: 53, ref: 66, spd: 31, pos: 65 } },
      { id: 'mohammad_amin', name: 'Mohammad Amin', pos: 'LW', ovr: 70, stats: { pac: 81, sho: 61, pas: 63, dri: 73, def: 25, phy: 51 } }
    ]
  },
  {
    id: 'sepahan',
    name: 'Sepahan FC',
    logo: '🟡⚫',
    squad: [
      { id: 'payam_niazmand', name: 'Payam Niazmand', pos: 'GK', ovr: 74, stats: { div: 74, han: 72, kic: 63, ref: 76, spd: 36, pos: 74 } },
      { id: 'mehdi_mehdipour', name: 'Mehdi Mehdipour', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 43, pas: 65, dri: 64, def: 70, phy: 65 } },
      { id: 'abbas_ebrahimi', name: 'Abbas Ebrahimi', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 36, pas: 62, dri: 55, def: 76, phy: 78 } },
      { id: 'mohammadreza_hosseini', name: 'Mohammadreza Hosseini', pos: 'CDM', ovr: 74, stats: { pac: 63, sho: 54, pas: 73, dri: 67, def: 76, phy: 72 } },
      { id: 'shahriar_moghanlou', name: 'Shahriar Moghanlou', pos: 'ST', ovr: 76, stats: { pac: 74, sho: 78, pas: 60, dri: 73, def: 28, phy: 76 } },
      { id: 'reza_shekari', name: 'Reza Shekari', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 34, pas: 60, dri: 53, def: 74, phy: 75 } },
      { id: 'mehdi_kiani', name: 'Mehdi Kiani', pos: 'LB', ovr: 70, stats: { pac: 74, sho: 42, pas: 63, dri: 63, def: 69, phy: 63 } },
      { id: 'ali_shojaei', name: 'Ali Shojaei', pos: 'CAM', ovr: 73, stats: { pac: 70, sho: 70, pas: 75, dri: 77, def: 36, phy: 54 } },
      { id: 'omid_noorafkan', name: 'Omid Noorafkan', pos: 'CM', ovr: 72, stats: { pac: 68, sho: 63, pas: 72, dri: 70, def: 58, phy: 61 } },
      { id: 'mehdi_ghayedi2', name: 'Aref Gholami', pos: 'RW', ovr: 72, stats: { pac: 83, sho: 63, pas: 65, dri: 76, def: 26, phy: 53 } },
      { id: 'gustavo_b', name: 'Gustavo Blanco', pos: 'LW', ovr: 74, stats: { pac: 85, sho: 66, pas: 68, dri: 78, def: 27, phy: 55 } },

      { id: 'alireza_haghighi', name: 'Alireza Haghighi', pos: 'GK', ovr: 64, stats: { div: 62, han: 61, kic: 52, ref: 65, spd: 30, pos: 64 } },
      { id: 'sajjad_shahbazzade', name: 'Sajjad Shahbazzade', pos: 'ST', ovr: 68, stats: { pac: 75, sho: 68, pas: 53, dri: 67, def: 24, phy: 62 } }
    ]
  },
  {
    id: 'tractor_sc',
    name: 'Tractor SC',
    logo: '🔴⚫',
    squad: [
      { id: 'ali_lorestani', name: 'Ali Lorestani', pos: 'GK', ovr: 73, stats: { div: 73, han: 71, kic: 62, ref: 75, spd: 35, pos: 73 } },
      { id: 'sohrab_moradi', name: 'Sohrab Moradi', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 35, pas: 61, dri: 54, def: 75, phy: 76 } },
      { id: 'saeid_akbari', name: 'Saeid Akbari', pos: 'CDM', ovr: 73, stats: { pac: 62, sho: 53, pas: 72, dri: 66, def: 75, phy: 71 } },
      { id: 'gaston_silva', name: 'Gaston Silva', pos: 'LB', ovr: 76, stats: { pac: 82, sho: 47, pas: 71, dri: 71, def: 74, phy: 68 } },
      { id: 'shahriar_shahroudi', name: 'Shahriar Shahroudi', pos: 'ST', ovr: 74, stats: { pac: 76, sho: 76, pas: 58, dri: 72, def: 28, phy: 72 } },
      { id: 'seyed_mehdi', name: 'Seyed Mehdi Mousavi', pos: 'RB', ovr: 70, stats: { pac: 74, sho: 41, pas: 63, dri: 62, def: 68, phy: 63 } },
      { id: 'reza_jabiri', name: 'Reza Jabiri', pos: 'ST', ovr: 73, stats: { pac: 77, sho: 74, pas: 57, dri: 71, def: 27, phy: 70 } },
      { id: 'ashkan_karimi', name: 'Ashkan Karimi', pos: 'CAM', ovr: 72, stats: { pac: 69, sho: 68, pas: 73, dri: 76, def: 35, phy: 52 } },
      { id: 'milad_zeneyedpour', name: 'Milad Zeneyedpour', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 34, pas: 60, dri: 53, def: 74, phy: 75 } },
      { id: 'aref_aghasi', name: 'Aref Aghasi', pos: 'CM', ovr: 70, stats: { pac: 65, sho: 60, pas: 70, dri: 67, def: 56, phy: 59 } },
      { id: 'karim_ansarifard', name: 'Karim Ansarifard', pos: 'ST', ovr: 75, stats: { pac: 74, sho: 77, pas: 62, dri: 73, def: 30, phy: 76 } },

      { id: 'javad_kazemian', name: 'Javad Kazemian', pos: 'GK', ovr: 62, stats: { div: 60, han: 59, kic: 50, ref: 63, spd: 28, pos: 62 } },
      { id: 'danial_moghadam', name: 'Danial Moghadam', pos: 'LW', ovr: 68, stats: { pac: 79, sho: 60, pas: 62, dri: 71, def: 24, phy: 50 } }
    ]
  },
  {
    id: 'al_shorta',
    name: 'Al Shorta',
    logo: '🔵⚪',
    squad: [
      { id: 'jalal_hassan', name: 'Jalal Hassan', pos: 'GK', ovr: 76, stats: { div: 76, han: 74, kic: 65, ref: 78, spd: 37, pos: 76 } },
      { id: 'ahmed_yasin', name: 'Ahmed Yasin', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 37, pas: 63, dri: 56, def: 77, phy: 79 } },
      { id: 'rebin_sulaka', name: 'Rebin Sulaka', pos: 'CM', ovr: 74, stats: { pac: 70, sho: 66, pas: 76, dri: 74, def: 60, phy: 63 } },
      { id: 'mohanad_ali', name: 'Mohanad Ali', pos: 'ST', ovr: 76, stats: { pac: 77, sho: 78, pas: 60, dri: 74, def: 29, phy: 74 } },
      { id: 'ali_jasim', name: 'Ali Jasim', pos: 'RW', ovr: 75, stats: { pac: 86, sho: 68, pas: 68, dri: 79, def: 27, phy: 56 } },
      { id: 'amir_al_ammari', name: 'Amir Al-Ammari', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 43, pas: 65, dri: 64, def: 70, phy: 65 } },
      { id: 'hussein_ali', name: 'Hussein Ali', pos: 'CDM', ovr: 73, stats: { pac: 63, sho: 54, pas: 73, dri: 67, def: 76, phy: 72 } },
      { id: 'zaid_tahseen', name: 'Zaid Tahseen', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 35, pas: 61, dri: 54, def: 75, phy: 76 } },
      { id: 'akam_h', name: 'Akam Hashim', pos: 'LB', ovr: 70, stats: { pac: 74, sho: 42, pas: 63, dri: 63, def: 69, phy: 63 } },
      { id: 'mahmoud_al_mawas', name: 'Mahmoud Al-Mawas', pos: 'CAM', ovr: 73, stats: { pac: 71, sho: 70, pas: 75, dri: 77, def: 37, phy: 54 } },
      { id: 'karrar_amer', name: 'Karrar Amer', pos: 'LW', ovr: 72, stats: { pac: 83, sho: 63, pas: 65, dri: 76, def: 26, phy: 53 } },

      { id: 'fahad_talib', name: 'Fahad Talib', pos: 'GK', ovr: 63, stats: { div: 61, han: 60, kic: 51, ref: 64, spd: 29, pos: 63 } },
      { id: 'ali_faez', name: 'Ali Faez', pos: 'CM', ovr: 68, stats: { pac: 64, sho: 58, pas: 69, dri: 66, def: 55, phy: 59 } }
    ]
  },
  {
    id: 'al_zawraa',
    name: 'Al Zawraa',
    logo: '⚪⚫',
    squad: [
      { id: 'mohammed_hameed', name: 'Mohammed Hameed', pos: 'GK', ovr: 73, stats: { div: 73, han: 71, kic: 62, ref: 75, spd: 35, pos: 73 } },
      { id: 'alaa_abbas', name: 'Alaa Abbas', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 35, pas: 61, dri: 54, def: 75, phy: 77 } },
      { id: 'aymen_hussein', name: 'Aymen Hussein', pos: 'ST', ovr: 75, stats: { pac: 76, sho: 77, pas: 59, dri: 73, def: 28, phy: 73 } },
      { id: 'osama_rashid', name: 'Osama Rashid', pos: 'RW', ovr: 73, stats: { pac: 83, sho: 64, pas: 66, dri: 77, def: 26, phy: 54 } },
      { id: 'bashar_resan', name: 'Bashar Resan', pos: 'CAM', ovr: 76, stats: { pac: 72, sho: 73, pas: 78, dri: 80, def: 39, phy: 57 } },
      { id: 'ahmed_ibrahim', name: 'Ahmed Ibrahim', pos: 'RB', ovr: 70, stats: { pac: 74, sho: 42, pas: 63, dri: 62, def: 68, phy: 63 } },
      { id: 'hasan_raed', name: 'Hasan Raed', pos: 'CDM', ovr: 72, stats: { pac: 62, sho: 53, pas: 71, dri: 65, def: 74, phy: 70 } },
      { id: 'sajjad_jassim', name: 'Sajjad Jassim', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 34, pas: 60, dri: 53, def: 74, phy: 75 } },
      { id: 'ali_hussein', name: 'Ali Hussein', pos: 'LB', ovr: 69, stats: { pac: 73, sho: 41, pas: 62, dri: 62, def: 67, phy: 62 } },
      { id: 'safaa_hadi', name: 'Safaa Hadi', pos: 'CM', ovr: 70, stats: { pac: 65, sho: 60, pas: 70, dri: 67, def: 56, phy: 59 } },
      { id: 'mahmoud_hamdi', name: 'Mahmoud Hamdi', pos: 'LW', ovr: 70, stats: { pac: 81, sho: 61, pas: 63, dri: 74, def: 25, phy: 51 } },

      { id: 'hussein_kadhim', name: 'Hussein Kadhim', pos: 'GK', ovr: 61, stats: { div: 59, han: 58, kic: 49, ref: 62, spd: 27, pos: 61 } },
      { id: 'ali_adnan_jr', name: 'Ali Adnan', pos: 'LB', ovr: 74, stats: { pac: 79, sho: 45, pas: 68, dri: 68, def: 71, phy: 65 } }
    ]
  },
  {
    id: 'naft_al_wasat',
    name: 'Naft Al-Wasat',
    logo: '🟢⚪',
    squad: [
      { id: 'karrar_mohammed', name: 'Karrar Mohammed', pos: 'GK', ovr: 68, stats: { div: 68, han: 66, kic: 57, ref: 70, spd: 32, pos: 68 } },
      { id: 'thaer_jassam', name: 'Thaer Jassam', pos: 'CB', ovr: 68, stats: { pac: 58, sho: 32, pas: 58, dri: 51, def: 71, phy: 72 } },
      { id: 'hussam_kadhim', name: 'Hussam Kadhim', pos: 'ST', ovr: 70, stats: { pac: 73, sho: 71, pas: 55, dri: 68, def: 25, phy: 66 } },
      { id: 'ahmed_menajed', name: 'Ahmed Menajed', pos: 'CM', ovr: 69, stats: { pac: 63, sho: 58, pas: 68, dri: 66, def: 55, phy: 58 } },
      { id: 'karrar_jasim', name: 'Karrar Jasim', pos: 'RB', ovr: 67, stats: { pac: 71, sho: 39, pas: 60, dri: 60, def: 65, phy: 60 } },
      { id: 'mohammed_qasim', name: 'Mohammed Qasim', pos: 'CDM', ovr: 68, stats: { pac: 58, sho: 49, pas: 66, dri: 61, def: 71, phy: 67 } },
      { id: 'ali_hameed', name: 'Ali Hameed', pos: 'RW', ovr: 69, stats: { pac: 79, sho: 59, pas: 62, dri: 71, def: 24, phy: 49 } },
      { id: 'yasir_kasim', name: 'Yasir Kasim', pos: 'CB', ovr: 67, stats: { pac: 57, sho: 31, pas: 57, dri: 50, def: 70, phy: 71 } },
      { id: 'firas_ali', name: 'Firas Ali', pos: 'LB', ovr: 66, stats: { pac: 70, sho: 38, pas: 59, dri: 59, def: 64, phy: 59 } },
      { id: 'mustafa_saadoon', name: 'Mustafa Saadoon', pos: 'CAM', ovr: 68, stats: { pac: 65, sho: 65, pas: 69, dri: 72, def: 33, phy: 48 } },
      { id: 'saif_salman', name: 'Saif Salman', pos: 'LW', ovr: 67, stats: { pac: 77, sho: 57, pas: 60, dri: 68, def: 22, phy: 47 } },

      { id: 'sajjad_kadhim', name: 'Sajjad Kadhim', pos: 'GK', ovr: 58, stats: { div: 56, han: 55, kic: 46, ref: 59, spd: 25, pos: 58 } },
      { id: 'ali_bahjat', name: 'Ali Bahjat', pos: 'ST', ovr: 64, stats: { pac: 70, sho: 63, pas: 49, dri: 62, def: 20, phy: 56 } }
    ]
  },
  {
    id: 'shanghai_port',
    name: 'Shanghai Port',
    logo: '🔴⚪',
    squad: [
      { id: 'yan_junling', name: 'Yan Junling', pos: 'GK', ovr: 78, stats: { div: 78, han: 76, kic: 68, ref: 80, spd: 38, pos: 78 } },
      { id: 'wang_shenchao', name: 'Wang Shenchao', pos: 'CDM', ovr: 75, stats: { pac: 64, sho: 56, pas: 75, dri: 69, def: 78, phy: 74 } },
      { id: 'fu_huan', name: 'Fu Huan', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 37, pas: 63, dri: 56, def: 77, phy: 79 } },
      { id: 'oscar_r', name: 'Oscar dos Santos', pos: 'CAM', ovr: 84, stats: { pac: 70, sho: 78, pas: 87, dri: 85, def: 45, phy: 65 } },
      { id: 'wu_lei', name: 'Wu Lei', pos: 'ST', ovr: 78, stats: { pac: 80, sho: 79, pas: 65, dri: 78, def: 32, phy: 68 }, altPos: ['RW'] },
      { id: 'lu_wenjun', name: 'Lu Wenjun', pos: 'RB', ovr: 73, stats: { pac: 76, sho: 45, pas: 68, dri: 66, def: 71, phy: 67 } },
      { id: 'gustavo_p', name: 'Gustavo Pereira', pos: 'ST', ovr: 78, stats: { pac: 76, sho: 80, pas: 62, dri: 76, def: 30, phy: 78 } },
      { id: 'zhang_linpeng', name: 'Zhang Linpeng', pos: 'CB', ovr: 73, stats: { pac: 62, sho: 35, pas: 62, dri: 55, def: 76, phy: 78 } },
      { id: 'yu_hanchao', name: 'Yu Hanchao', pos: 'LW', ovr: 75, stats: { pac: 82, sho: 68, pas: 71, dri: 78, def: 29, phy: 58 } },
      { id: 'zhao_mingjian', name: 'Zhao Mingjian', pos: 'LB', ovr: 72, stats: { pac: 75, sho: 44, pas: 66, dri: 65, def: 70, phy: 65 } },
      { id: 'liu_junshuai', name: 'Liu Junshuai', pos: 'CM', ovr: 73, stats: { pac: 68, sho: 64, pas: 74, dri: 72, def: 59, phy: 62 } },

      { id: 'chen_wei_c', name: 'Chen Wei', pos: 'GK', ovr: 66, stats: { div: 64, han: 63, kic: 54, ref: 67, spd: 32, pos: 66 } },
      { id: 'lyu_wenjun', name: 'Lyu Wenjun', pos: 'CM', ovr: 69, stats: { pac: 65, sho: 60, pas: 70, dri: 67, def: 57, phy: 60 } }
    ]
  },
  {
    id: 'shandong_taishan',
    name: 'Shandong Taishan',
    logo: '🔴⚫',
    squad: [
      { id: 'wang_dalei', name: 'Wang Dalei', pos: 'GK', ovr: 76, stats: { div: 76, han: 74, kic: 65, ref: 78, spd: 37, pos: 76 } },
      { id: 'jiang_guangtai', name: 'Jiang Guangtai', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 36, pas: 62, dri: 55, def: 76, phy: 78 } },
      { id: 'moises_r', name: 'Moises Ribeiro', pos: 'CM', ovr: 78, stats: { pac: 72, sho: 73, pas: 79, dri: 79, def: 62, phy: 68 } },
      { id: 'roger_g2', name: 'Fernandinho Bahia', pos: 'ST', ovr: 77, stats: { pac: 77, sho: 79, pas: 61, dri: 75, def: 29, phy: 75 } },
      { id: 'jorge_fellipe', name: 'Jorge Fellipe', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 37, pas: 63, dri: 56, def: 77, phy: 80 } },
      { id: 'sun_jun', name: 'Sun Jun', pos: 'CDM', ovr: 73, stats: { pac: 63, sho: 53, pas: 72, dri: 66, def: 76, phy: 71 } },
      { id: 'guo_tianyu', name: 'Guo Tianyu', pos: 'RW', ovr: 74, stats: { pac: 84, sho: 65, pas: 67, dri: 77, def: 27, phy: 55 } },
      { id: 'zhu_jianrong', name: 'Zhu Jianrong', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 43, pas: 65, dri: 64, def: 70, phy: 65 } },
      { id: 'liu_zhenli', name: 'Liu Zhenli', pos: 'LB', ovr: 70, stats: { pac: 74, sho: 42, pas: 63, dri: 63, def: 69, phy: 63 } },
      { id: 'daniel_carrico', name: 'Daniel Carrico', pos: 'CB', ovr: 74, stats: { pac: 63, sho: 37, pas: 65, dri: 57, def: 78, phy: 82 } },
      { id: 'fernandinho_l', name: 'Leo Baptistao', pos: 'LW', ovr: 76, stats: { pac: 83, sho: 71, pas: 69, dri: 79, def: 28, phy: 62 } },

      { id: 'sun_shoujiang', name: 'Sun Shoujiang', pos: 'GK', ovr: 64, stats: { div: 62, han: 61, kic: 52, ref: 65, spd: 30, pos: 64 } },
      { id: 'chen_pu', name: 'Chen Pu', pos: 'CM', ovr: 68, stats: { pac: 64, sho: 58, pas: 69, dri: 66, def: 55, phy: 59 } }
    ]
  },
  {
    id: 'beijing_guoan',
    name: 'Beijing Guoan',
    logo: '🟢⚪',
    squad: [
      { id: 'hou_yu', name: 'Hou Yu', pos: 'GK', ovr: 74, stats: { div: 74, han: 72, kic: 63, ref: 76, spd: 36, pos: 74 } },
      { id: 'zhang_yuning', name: 'Zhang Yuning', pos: 'ST', ovr: 76, stats: { pac: 76, sho: 78, pas: 60, dri: 74, def: 29, phy: 76 } },
      { id: 'jiang_zhipeng', name: 'Jiang Zhipeng', pos: 'LB', ovr: 74, stats: { pac: 78, sho: 46, pas: 68, dri: 67, def: 72, phy: 67 } },
      { id: 'yu_dabao', name: 'Yu Dabao', pos: 'ST', ovr: 73, stats: { pac: 75, sho: 74, pas: 57, dri: 71, def: 27, phy: 71 } },
      { id: 'li_lei', name: 'Li Lei', pos: 'RB', ovr: 73, stats: { pac: 77, sho: 45, pas: 68, dri: 66, def: 71, phy: 66 } },
      { id: 'ao_kun', name: 'Ao Kun', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 35, pas: 61, dri: 54, def: 75, phy: 77 } },
      { id: 'penalba_a', name: 'Alan Penalba', pos: 'CM', ovr: 74, stats: { pac: 69, sho: 65, pas: 75, dri: 73, def: 59, phy: 62 } },
      { id: 'jonathan_v', name: 'Jonathan Viera', pos: 'CAM', ovr: 78, stats: { pac: 70, sho: 76, pas: 81, dri: 82, def: 41, phy: 58 } },
      { id: 'liu_yang', name: 'Liu Yang', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 34, pas: 60, dri: 53, def: 74, phy: 75 } },
      { id: 'wang_gang', name: 'Wang Gang', pos: 'CDM', ovr: 72, stats: { pac: 61, sho: 52, pas: 71, dri: 65, def: 74, phy: 70 } },
      { id: 'han_kexin', name: 'Han Kexin', pos: 'RW', ovr: 72, stats: { pac: 82, sho: 62, pas: 64, dri: 75, def: 26, phy: 52 } },

      { id: 'guo_quanbo', name: 'Guo Quanbo', pos: 'GK', ovr: 64, stats: { div: 62, han: 61, kic: 52, ref: 65, spd: 30, pos: 64 } },
      { id: 'huang_zhengyu', name: 'Huang Zhengyu', pos: 'ST', ovr: 68, stats: { pac: 74, sho: 67, pas: 53, dri: 66, def: 24, phy: 61 } }
    ]
  },
  {
    id: 'zhejiang_fc',
    name: 'Zhejiang FC',
    logo: '🔵🟡',
    squad: [
      { id: 'zhan_zhengfang', name: 'Zhan Zhengfang', pos: 'GK', ovr: 72, stats: { div: 72, han: 70, kic: 61, ref: 74, spd: 34, pos: 72 } },
      { id: 'luo_jing', name: 'Luo Jing', pos: 'CB', ovr: 70, stats: { pac: 60, sho: 34, pas: 60, dri: 52, def: 73, phy: 74 } },
      { id: 'romulo_o', name: 'Romulo Otero', pos: 'CAM', ovr: 77, stats: { pac: 71, sho: 74, pas: 78, dri: 80, def: 38, phy: 57 } },
      { id: 'jonathan_a', name: 'Jonathan Aspropotamitis', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 34, pas: 60, dri: 53, def: 74, phy: 75 } },
      { id: 'frank_c', name: 'Frank Castañeda', pos: 'RW', ovr: 74, stats: { pac: 84, sho: 65, pas: 67, dri: 77, def: 27, phy: 54 } },
      { id: 'wang_haijian', name: 'Wang Haijian', pos: 'CM', ovr: 73, stats: { pac: 69, sho: 64, pas: 74, dri: 72, def: 59, phy: 62 } },
      { id: 'chen_hao', name: 'Chen Hao', pos: 'ST', ovr: 73, stats: { pac: 76, sho: 74, pas: 57, dri: 71, def: 27, phy: 70 } },
      { id: 'yu_lang', name: 'Yu Lang', pos: 'RB', ovr: 70, stats: { pac: 74, sho: 42, pas: 63, dri: 62, def: 68, phy: 63 } },
      { id: 'gao_tianyi', name: 'Gao Tianyi', pos: 'LB', ovr: 69, stats: { pac: 73, sho: 41, pas: 62, dri: 61, def: 67, phy: 62 } },
      { id: 'wang_zhenao', name: 'Wang Zhen\u2019ao', pos: 'CDM', ovr: 71, stats: { pac: 61, sho: 52, pas: 70, dri: 64, def: 74, phy: 69 } },
      { id: 'ye_weijun', name: 'Ye Weijun', pos: 'LW', ovr: 70, stats: { pac: 80, sho: 60, pas: 63, dri: 72, def: 25, phy: 51 } },

      { id: 'wu_yayan', name: 'Wu Yayan', pos: 'GK', ovr: 62, stats: { div: 60, han: 59, kic: 50, ref: 63, spd: 28, pos: 62 } },
      { id: 'jin_jingdao', name: 'Jin Jingdao', pos: 'CM', ovr: 67, stats: { pac: 63, sho: 57, pas: 68, dri: 65, def: 54, phy: 58 } }
    ]
  },
  {
    id: 'melbourne_city',
    name: 'Melbourne City',
    logo: '🔵⚪',
    squad: [
      { id: 'tom_glover', name: 'Tom Glover', pos: 'GK', ovr: 75, stats: { div: 75, han: 73, kic: 64, ref: 77, spd: 36, pos: 75 } },
      { id: 'nuno_reis', name: 'Nuno Reis', pos: 'CB', ovr: 74, stats: { pac: 65, sho: 38, pas: 64, dri: 57, def: 77, phy: 79 } },
      { id: 'jamie_maclaren', name: 'Jamie Maclaren', pos: 'ST', ovr: 78, stats: { pac: 80, sho: 80, pas: 61, dri: 76, def: 30, phy: 70 } },
      { id: 'mathew_leckie', name: 'Mathew Leckie', pos: 'RW', ovr: 76, stats: { pac: 85, sho: 70, pas: 71, dri: 79, def: 30, phy: 60 } },
      { id: 'aiden_ohara', name: "Aiden O'Neill", pos: 'CM', ovr: 74, stats: { pac: 69, sho: 65, pas: 76, dri: 73, def: 61, phy: 64 } },
      { id: 'curtis_good', name: 'Curtis Good', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 37, pas: 63, dri: 55, def: 76, phy: 78 } },
      { id: 'scott_galloway', name: 'Scott Galloway', pos: 'RB', ovr: 72, stats: { pac: 76, sho: 45, pas: 68, dri: 66, def: 71, phy: 67 } },
      { id: 'marco_tilio', name: 'Marco Tilio', pos: 'LW', ovr: 75, stats: { pac: 86, sho: 67, pas: 69, dri: 79, def: 27, phy: 55 } },
      { id: 'jordan_bos', name: 'Jordan Bos', pos: 'LB', ovr: 71, stats: { pac: 75, sho: 43, pas: 66, dri: 65, def: 70, phy: 65 } },
      { id: 'callum_talbot', name: 'Callum Talbot', pos: 'CDM', ovr: 71, stats: { pac: 61, sho: 52, pas: 70, dri: 64, def: 74, phy: 69 } },
      { id: 'zach_sapsford', name: 'Zach Sapsford', pos: 'CAM', ovr: 72, stats: { pac: 71, sho: 69, pas: 74, dri: 76, def: 35, phy: 52 } },

      { id: 'jamie_young', name: 'Jamie Young', pos: 'GK', ovr: 68, stats: { div: 66, han: 65, kic: 56, ref: 69, spd: 33, pos: 68 } },
      { id: 'connor_metcalfe', name: 'Connor Metcalfe', pos: 'CM', ovr: 71, stats: { pac: 67, sho: 62, pas: 72, dri: 70, def: 58, phy: 61 } }
    ]
  },
  {
    id: 'sydney_fc',
    name: 'Sydney FC',
    logo: '🔵🌤️',
    squad: [
      { id: 'andrew_redmayne', name: 'Andrew Redmayne', pos: 'GK', ovr: 75, stats: { div: 75, han: 73, kic: 64, ref: 77, spd: 36, pos: 75 } },
      { id: 'joel_king', name: 'Joel King', pos: 'LB', ovr: 73, stats: { pac: 78, sho: 45, pas: 67, dri: 67, def: 72, phy: 67 } },
      { id: 'robert_mak', name: 'Robert Mak', pos: 'RW', ovr: 76, stats: { pac: 87, sho: 71, pas: 70, dri: 80, def: 28, phy: 60 } },
      { id: 'anthony_caceres', name: 'Anthony Caceres', pos: 'CM', ovr: 75, stats: { pac: 68, sho: 68, pas: 78, dri: 76, def: 62, phy: 64 } },
      { id: 'max_burgess', name: 'Max Burgess', pos: 'CAM', ovr: 72, stats: { pac: 70, sho: 68, pas: 73, dri: 75, def: 35, phy: 52 } },
      { id: 'alex_baumann', name: 'Alex Baumann', pos: 'CM', ovr: 71, stats: { pac: 67, sho: 61, pas: 71, dri: 69, def: 58, phy: 60 } },
      { id: 'aiden_calderon', name: 'Adam Le Fondre', pos: 'ST', ovr: 76, stats: { pac: 71, sho: 78, pas: 58, dri: 72, def: 28, phy: 74 } },
      { id: 'zac_sapsford2', name: 'Ryan Teague', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 35, pas: 62, dri: 55, def: 75, phy: 76 } },
      { id: 'aaron_calver', name: 'Aaron Calver', pos: 'CB', ovr: 73, stats: { pac: 63, sho: 36, pas: 63, dri: 56, def: 76, phy: 77 } },
      { id: 'rhyan_grant', name: 'Rhyan Grant', pos: 'RB', ovr: 73, stats: { pac: 76, sho: 44, pas: 67, dri: 65, def: 71, phy: 66 } },
      { id: 'luke_brattan', name: 'Luke Brattan', pos: 'CDM', ovr: 73, stats: { pac: 62, sho: 53, pas: 74, dri: 67, def: 75, phy: 71 } },

      { id: 'james_donachie', name: 'James Donachie', pos: 'GK', ovr: 65, stats: { div: 63, han: 62, kic: 53, ref: 66, spd: 31, pos: 65 } },
      { id: 'jaiden_kucharski', name: 'Jaiden Kucharski', pos: 'RW', ovr: 69, stats: { pac: 81, sho: 60, pas: 62, dri: 72, def: 24, phy: 49 } }
    ]
  },
  {
    id: 'central_coast_mariners',
    name: 'Central Coast Mariners',
    logo: '🟡🧭',
    squad: [
      { id: 'danny_vukovic', name: 'Danny Vukovic', pos: 'GK', ovr: 74, stats: { div: 74, han: 72, kic: 63, ref: 76, spd: 35, pos: 74 } },
      { id: 'jason_cummings', name: 'Jason Cummings', pos: 'ST', ovr: 76, stats: { pac: 74, sho: 78, pas: 60, dri: 74, def: 28, phy: 73 } },
      { id: 'josh_nisbet', name: 'Josh Nisbet', pos: 'CM', ovr: 73, stats: { pac: 68, sho: 64, pas: 74, dri: 72, def: 59, phy: 62 } },
      { id: 'jacob_farrell', name: 'Jacob Farrell', pos: 'RB', ovr: 71, stats: { pac: 76, sho: 44, pas: 66, dri: 65, def: 70, phy: 65 } },
      { id: 'zachary_sapsford3', name: 'Zachary Sotiropoulos', pos: 'RW', ovr: 74, stats: { pac: 85, sho: 66, pas: 68, dri: 78, def: 27, phy: 55 } },
      { id: 'kye_rowles', name: 'Kye Rowles', pos: 'CB', ovr: 74, stats: { pac: 66, sho: 38, pas: 65, dri: 58, def: 77, phy: 79 } },
      { id: 'jason_hoffman', name: 'Jason Hoffman', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 34, pas: 61, dri: 53, def: 74, phy: 75 } },
      { id: 'ryan_teague2', name: 'Ryan Teague2', pos: 'LB', ovr: 70, stats: { pac: 74, sho: 42, pas: 64, dri: 63, def: 69, phy: 63 } },
      { id: 'marco_urena', name: 'Marco Urena', pos: 'ST', ovr: 73, stats: { pac: 76, sho: 74, pas: 57, dri: 71, def: 27, phy: 69 } },
      { id: 'jacob_italiano', name: 'Jacob Italiano', pos: 'CDM', ovr: 71, stats: { pac: 60, sho: 51, pas: 70, dri: 63, def: 73, phy: 68 } },
      { id: 'mackenzie_hargreaves', name: 'Mackenzie Hargreaves', pos: 'CB', ovr: 70, stats: { pac: 59, sho: 33, pas: 59, dri: 51, def: 72, phy: 73 } },

      { id: 'ryan_scott', name: 'Ryan Scott', pos: 'GK', ovr: 63, stats: { div: 61, han: 60, kic: 51, ref: 64, spd: 29, pos: 63 } },
      { id: 'oliver_bozanic', name: 'Oliver Bozanic', pos: 'CAM', ovr: 70, stats: { pac: 62, sho: 66, pas: 73, dri: 72, def: 40, phy: 55 } }
    ]
  },
  {
    id: 'benfica',
    name: 'SL Benfica',
    logo: '🔴⚪',
    squad: [
      { id: 'trubin_a', name: 'Anatoliy Trubin', pos: 'GK', ovr: 82, stats: { div: 82, han: 80, kic: 72, ref: 84, spd: 42, pos: 82 } },
      { id: 'bah_a', name: 'Alexander Bah', pos: 'RB', ovr: 78, stats: { pac: 83, sho: 52, pas: 74, dri: 73, def: 76, phy: 71 } },
      { id: 'otamendi_n', name: 'Nicolas Otamendi', pos: 'CB', ovr: 80, stats: { pac: 66, sho: 42, pas: 71, dri: 62, def: 83, phy: 84 } },
      { id: 'araujo_a', name: 'Antonio Silva', pos: 'CB', ovr: 81, stats: { pac: 76, sho: 40, pas: 74, dri: 67, def: 84, phy: 80 } },
      { id: 'carreras_a', name: 'Alvaro Carreras', pos: 'LB', ovr: 78, stats: { pac: 81, sho: 51, pas: 76, dri: 78, def: 74, phy: 68 } },
      { id: 'florentino_l', name: 'Florentino Luis', pos: 'CDM', ovr: 79, stats: { pac: 66, sho: 60, pas: 79, dri: 74, def: 80, phy: 77 } },
      { id: 'aursnes_f', name: 'Fredrik Aursnes', pos: 'CM', ovr: 78, stats: { pac: 70, sho: 68, pas: 78, dri: 75, def: 68, phy: 71 } },
      { id: 'kokcu_o', name: 'Orkun Kokcu', pos: 'CM', ovr: 82, stats: { pac: 73, sho: 78, pas: 84, dri: 82, def: 66, phy: 74 } },
      { id: 'akturkoglu_k', name: 'Kerem Akturkoglu', pos: 'LW', ovr: 79, stats: { pac: 85, sho: 74, pas: 74, dri: 82, def: 33, phy: 62 } },
      { id: 'pavlidis_v', name: 'Vangelis Pavlidis', pos: 'ST', ovr: 82, stats: { pac: 78, sho: 84, pas: 62, dri: 78, def: 34, phy: 78 } },
      { id: 'schjelderup_a', name: 'Andreas Schjelderup', pos: 'RW', ovr: 79, stats: { pac: 84, sho: 76, pas: 76, dri: 83, def: 32, phy: 60 } },

      { id: 'samuel_soares', name: 'Samuel Soares', pos: 'GK', ovr: 71, stats: { div: 69, han: 68, kic: 60, ref: 72, spd: 34, pos: 71 } },
      { id: 'jota_silva_r', name: 'Renato Sanches', pos: 'CM', ovr: 79, stats: { pac: 78, sho: 74, pas: 78, dri: 82, def: 62, phy: 75 } },
      { id: 'belotti_a', name: 'Andrea Belotti', pos: 'ST', ovr: 76, stats: { pac: 71, sho: 77, pas: 58, dri: 72, def: 30, phy: 76 } }
    ]
  },
  {
    id: 'sporting_cp',
    name: 'Sporting CP',
    logo: '🟢⚪',
    squad: [
      { id: 'israel_f', name: 'Franco Israel', pos: 'GK', ovr: 79, stats: { div: 79, han: 77, kic: 69, ref: 81, spd: 39, pos: 79 } },
      { id: 'goncalo_inacio', name: 'Goncalo Inacio', pos: 'CB', ovr: 82, stats: { pac: 75, sho: 40, pas: 76, dri: 67, def: 85, phy: 80 } },
      { id: 'st_juste_o', name: 'Ousmane Diomande', pos: 'CB', ovr: 81, stats: { pac: 78, sho: 38, pas: 70, dri: 63, def: 84, phy: 84 } },
      { id: 'quenda_g', name: 'Geovany Quenda', pos: 'RW', ovr: 81, stats: { pac: 92, sho: 74, pas: 76, dri: 87, def: 30, phy: 58 } },
      { id: 'morita_h', name: 'Hidemasa Morita', pos: 'CDM', ovr: 80, stats: { pac: 68, sho: 62, pas: 80, dri: 75, def: 81, phy: 76 } },
      { id: 'trincao_f', name: 'Francisco Trincao', pos: 'LW', ovr: 82, stats: { pac: 85, sho: 78, pas: 78, dri: 85, def: 32, phy: 63 } },
      { id: 'harder_c', name: 'Conrad Harder', pos: 'ST', ovr: 79, stats: { pac: 76, sho: 79, pas: 61, dri: 75, def: 31, phy: 75 } },
      { id: 'esgaio_e', name: 'Eduardo Quaresma', pos: 'RB', ovr: 74, stats: { pac: 78, sho: 46, pas: 68, dri: 66, def: 73, phy: 69 } },
      { id: 'reis_g', name: 'Ricardo Esgaio', pos: 'LB', ovr: 75, stats: { pac: 79, sho: 47, pas: 70, dri: 68, def: 74, phy: 68 } },
      { id: 'hjulmand_m', name: 'Morten Hjulmand', pos: 'CDM', ovr: 79, stats: { pac: 66, sho: 62, pas: 79, dri: 73, def: 80, phy: 77 } },
      { id: 'debast_z', name: 'Zeno Debast', pos: 'CB', ovr: 77, stats: { pac: 73, sho: 38, pas: 71, dri: 63, def: 80, phy: 78 } },

      { id: 'diego_callai', name: 'Diogo Pinto', pos: 'GK', ovr: 68, stats: { div: 66, han: 65, kic: 56, ref: 69, spd: 33, pos: 68 } },
      { id: 'catamo_g', name: 'Geny Catamo', pos: 'RW', ovr: 76, stats: { pac: 86, sho: 68, pas: 70, dri: 79, def: 29, phy: 58 } }
    ]
  },
  {
    id: 'fc_porto',
    name: 'FC Porto',
    logo: '🔵⚪',
    squad: [
      { id: 'costa_diogo', name: 'Diogo Costa', pos: 'GK', ovr: 86, stats: { div: 86, han: 84, kic: 78, ref: 88, spd: 44, pos: 86 } },
      { id: 'wendell_w', name: 'Wendell', pos: 'LB', ovr: 78, stats: { pac: 79, sho: 50, pas: 74, dri: 76, def: 74, phy: 68 } },
      { id: 'perez_i', name: 'Ivan Marcano', pos: 'CB', ovr: 76, stats: { pac: 62, sho: 39, pas: 68, dri: 58, def: 80, phy: 82 } },
      { id: 'nico_g', name: 'Nico Gonzalez', pos: 'CDM', ovr: 79, stats: { pac: 66, sho: 62, pas: 80, dri: 75, def: 79, phy: 74 } },
      { id: 'varela_f', name: 'Francisco Conceicao', pos: 'RW', ovr: 81, stats: { pac: 88, sho: 74, pas: 74, dri: 84, def: 31, phy: 62 } },
      { id: 'namaso_g', name: 'Galeno', pos: 'LW', ovr: 80, stats: { pac: 89, sho: 75, pas: 73, dri: 84, def: 30, phy: 63 } },
      { id: 'evanilson_e', name: 'Evanilson', pos: 'ST', ovr: 81, stats: { pac: 78, sho: 82, pas: 63, dri: 78, def: 32, phy: 76 } },
      { id: 'grujic_m', name: 'Marko Grujic', pos: 'CM', ovr: 77, stats: { pac: 66, sho: 66, pas: 75, dri: 73, def: 68, phy: 78 } },
      { id: 'pepe_p', name: 'Pepe', pos: 'CB', ovr: 79, stats: { pac: 60, sho: 41, pas: 68, dri: 58, def: 82, phy: 83 } },
      { id: 'joao_mario', name: 'Joao Mario', pos: 'RB', ovr: 74, stats: { pac: 76, sho: 46, pas: 69, dri: 66, def: 73, phy: 68 } },
      { id: 'gyokeres_v', name: 'Danny Namaso', pos: 'CAM', ovr: 76, stats: { pac: 75, sho: 74, pas: 76, dri: 79, def: 40, phy: 60 } },

      { id: 'cristiano_c', name: 'Cristiano Ronaldo Jr Costa', pos: 'GK', ovr: 71, stats: { div: 69, han: 68, kic: 60, ref: 72, spd: 34, pos: 71 } },
      { id: 'pepe_2', name: 'Ivan Jaime', pos: 'CAM', ovr: 74, stats: { pac: 76, sho: 70, pas: 74, dri: 79, def: 35, phy: 55 } }
    ]
  },
  {
    id: 'sc_braga',
    name: 'SC Braga',
    logo: '🔴⚪',
    squad: [
      { id: 'matheus_r', name: 'Matheus Magalhaes', pos: 'GK', ovr: 76, stats: { div: 76, han: 74, kic: 65, ref: 78, spd: 37, pos: 76 } },
      { id: 'niakate_s', name: 'Souleymane Niakate', pos: 'CB', ovr: 74, stats: { pac: 65, sho: 38, pas: 63, dri: 56, def: 78, phy: 80 } },
      { id: 'victor_g', name: 'Victor Gomez', pos: 'RB', ovr: 74, stats: { pac: 78, sho: 46, pas: 69, dri: 68, def: 72, phy: 68 } },
      { id: 'moutinho_j', name: 'Joao Moutinho', pos: 'CM', ovr: 77, stats: { pac: 60, sho: 70, pas: 82, dri: 78, def: 62, phy: 64 } },
      { id: 'bruma_b', name: 'Bruma', pos: 'RW', ovr: 76, stats: { pac: 87, sho: 71, pas: 70, dri: 80, def: 29, phy: 60 } },
      { id: 'ricardo_horta', name: 'Ricardo Horta', pos: 'LW', ovr: 79, stats: { pac: 82, sho: 78, pas: 76, dri: 82, def: 33, phy: 64 } },
      { id: 'gabri_martinez', name: 'Roger Fernandes', pos: 'ST', ovr: 75, stats: { pac: 77, sho: 76, pas: 60, dri: 74, def: 29, phy: 71 } },
      { id: 'zalazar_g', name: 'Gabriel Moscardo', pos: 'CDM', ovr: 76, stats: { pac: 65, sho: 58, pas: 76, dri: 71, def: 78, phy: 74 } },
      { id: 'kevin_v', name: 'Kevin Vazquez', pos: 'LB', ovr: 72, stats: { pac: 76, sho: 44, pas: 67, dri: 66, def: 71, phy: 66 } },
      { id: 'jose_fonte', name: 'Jose Fonte', pos: 'CB', ovr: 73, stats: { pac: 58, sho: 38, pas: 68, dri: 55, def: 79, phy: 80 } },
      { id: 'al_musrati', name: 'Al-Musrati', pos: 'CDM', ovr: 76, stats: { pac: 63, sho: 55, pas: 75, dri: 70, def: 79, phy: 78 } },

      { id: 'nuno_santos', name: 'Nuno Santos', pos: 'GK', ovr: 66, stats: { div: 64, han: 63, kic: 54, ref: 67, spd: 32, pos: 66 } },
      { id: 'joao_novais', name: 'Joao Novais', pos: 'CAM', ovr: 74, stats: { pac: 73, sho: 71, pas: 76, dri: 78, def: 37, phy: 55 } }
    ]
  },
  {
    id: 'ajax',
    name: 'AFC Ajax',
    logo: '🔴⚪',
    squad: [
      { id: 'pasveer_r', name: 'Remko Pasveer', pos: 'GK', ovr: 78, stats: { div: 78, han: 76, kic: 68, ref: 80, spd: 38, pos: 78 } },
      { id: 'rensch_d', name: 'Devyne Rensch', pos: 'RB', ovr: 76, stats: { pac: 79, sho: 47, pas: 72, dri: 70, def: 74, phy: 68 } },
      { id: 'hato_j', name: 'Jorrel Hato', pos: 'CB', ovr: 79, stats: { pac: 77, sho: 40, pas: 74, dri: 68, def: 82, phy: 78 } },
      { id: 'sutalo_j', name: 'Josip Sutalo', pos: 'CB', ovr: 77, stats: { pac: 68, sho: 39, pas: 68, dri: 60, def: 80, phy: 81 } },
      { id: 'baas_b', name: 'Branco van den Boomen', pos: 'CM', ovr: 76, stats: { pac: 62, sho: 68, pas: 82, dri: 76, def: 61, phy: 63 } },
      { id: 'taylor_k', name: 'Kenneth Taylor', pos: 'CM', ovr: 78, stats: { pac: 71, sho: 70, pas: 80, dri: 78, def: 65, phy: 68 } },
      { id: 'godts_m', name: 'Mika Godts', pos: 'LW', ovr: 77, stats: { pac: 87, sho: 72, pas: 71, dri: 82, def: 29, phy: 58 } },
      { id: 'weghorst_w', name: 'Wout Weghorst', pos: 'ST', ovr: 78, stats: { pac: 68, sho: 79, pas: 60, dri: 71, def: 32, phy: 84 } },
      { id: 'berghuis_s', name: 'Steven Berghuis', pos: 'RW', ovr: 78, stats: { pac: 74, sho: 76, pas: 79, dri: 80, def: 38, phy: 62 } },
      { id: 'akpom_c', name: 'Chuba Akpom', pos: 'ST', ovr: 75, stats: { pac: 72, sho: 77, pas: 60, dri: 73, def: 30, phy: 74 } },
      { id: 'wieffer_m', name: 'Youri Regeer', pos: 'CDM', ovr: 76, stats: { pac: 65, sho: 58, pas: 76, dri: 71, def: 78, phy: 74 } },

      { id: 'stekelenburg_h', name: 'Diant Ramaj', pos: 'GK', ovr: 69, stats: { div: 67, han: 66, kic: 57, ref: 70, spd: 34, pos: 69 } },
      { id: 'gaaei_a', name: 'Anton Gaaei', pos: 'RB', ovr: 73, stats: { pac: 80, sho: 45, pas: 68, dri: 68, def: 71, phy: 66 } }
    ]
  },
  {
    id: 'psv',
    name: 'PSV Eindhoven',
    logo: '🔴⚪',
    squad: [
      { id: 'benitez_w', name: 'Walter Benitez', pos: 'GK', ovr: 82, stats: { div: 82, han: 80, kic: 71, ref: 84, spd: 41, pos: 82 } },
      { id: 'schouten_j', name: 'Jerdy Schouten', pos: 'CDM', ovr: 79, stats: { pac: 65, sho: 62, pas: 79, dri: 74, def: 80, phy: 76 } },
      { id: 'boscagli_o', name: 'Olivier Boscagli', pos: 'CB', ovr: 78, stats: { pac: 71, sho: 39, pas: 72, dri: 63, def: 81, phy: 80 } },
      { id: 'obispo_r', name: 'Ricardo Pepi', pos: 'ST', ovr: 79, stats: { pac: 80, sho: 80, pas: 61, dri: 76, def: 30, phy: 75 } },
      { id: 'til_g', name: 'Guus Til', pos: 'CAM', ovr: 78, stats: { pac: 73, sho: 76, pas: 78, dri: 79, def: 45, phy: 68 } },
      { id: 'saibari_i', name: 'Ismael Saibari', pos: 'RW', ovr: 79, stats: { pac: 84, sho: 74, pas: 78, dri: 82, def: 34, phy: 62 } },
      { id: 'perisic_i', name: 'Ivan Perisic', pos: 'LW', ovr: 79, stats: { pac: 80, sho: 76, pas: 77, dri: 79, def: 37, phy: 68 } },
      { id: 'dest_s', name: 'Sergino Dest', pos: 'RB', ovr: 77, stats: { pac: 85, sho: 50, pas: 74, dri: 76, def: 71, phy: 64 } },
      { id: 'flamingo_s', name: 'Sean Flamingo', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 37, pas: 65, dri: 57, def: 77, phy: 79 } },
      { id: 'lang_n', name: 'Noa Lang', pos: 'LW', ovr: 80, stats: { pac: 85, sho: 77, pas: 76, dri: 84, def: 30, phy: 60 } },
      { id: 'veerman_j', name: 'Joey Veerman', pos: 'CM', ovr: 79, stats: { pac: 63, sho: 74, pas: 82, dri: 79, def: 58, phy: 63 } },

      { id: 'drommel_j', name: 'Jeroen Zoet', pos: 'GK', ovr: 70, stats: { div: 68, han: 67, kic: 58, ref: 71, spd: 34, pos: 70 } },
      { id: 'ledezma_r', name: 'Richard Ledezma', pos: 'CM', ovr: 73, stats: { pac: 71, sho: 66, pas: 74, dri: 75, def: 58, phy: 58 } }
    ]
  },
  {
    id: 'feyenoord',
    name: 'Feyenoord',
    logo: '⚪🔴',
    squad: [
      { id: 'wellenreuther_j', name: 'Timon Wellenreuther', pos: 'GK', ovr: 78, stats: { div: 78, han: 76, kic: 67, ref: 80, spd: 38, pos: 78 } },
      { id: 'hancko_d', name: 'David Hancko', pos: 'CB', ovr: 81, stats: { pac: 75, sho: 44, pas: 76, dri: 67, def: 84, phy: 82 }, altPos: ['LB'] },
      { id: 'trauner_g', name: 'Gernot Trauner', pos: 'CB', ovr: 77, stats: { pac: 64, sho: 39, pas: 68, dri: 58, def: 80, phy: 81 } },
      { id: 'read_q', name: 'Quinten Timber', pos: 'CM', ovr: 79, stats: { pac: 74, sho: 68, pas: 80, dri: 79, def: 66, phy: 65 } },
      { id: 'paixao_i', name: 'Igor Paixao', pos: 'LW', ovr: 80, stats: { pac: 89, sho: 74, pas: 74, dri: 84, def: 30, phy: 63 } },
      { id: 'gimenez_s', name: 'Santiago Gimenez', pos: 'ST', ovr: 81, stats: { pac: 79, sho: 82, pas: 62, dri: 77, def: 32, phy: 74 } },
      { id: 'hartman_q', name: 'Quilindschy Hartman', pos: 'LB', ovr: 76, stats: { pac: 83, sho: 47, pas: 71, dri: 74, def: 73, phy: 66 } },
      { id: 'geertruida_l', name: 'Lutsharel Geertruida', pos: 'RB', ovr: 78, stats: { pac: 81, sho: 48, pas: 74, dri: 72, def: 76, phy: 71 } },
      { id: 'wieffer_m2', name: 'Mats Wieffer', pos: 'CDM', ovr: 78, stats: { pac: 66, sho: 60, pas: 78, dri: 74, def: 79, phy: 75 } },
      { id: 'moder_j', name: 'Jakub Moder', pos: 'CM', ovr: 75, stats: { pac: 68, sho: 66, pas: 75, dri: 74, def: 63, phy: 68 } },
      { id: 'jahanbakhsh_a', name: 'Anis Hadj Moussa', pos: 'RW', ovr: 76, stats: { pac: 87, sho: 68, pas: 68, dri: 80, def: 28, phy: 58 } },

      { id: 'kelly_j', name: 'Justin Bijlow', pos: 'GK', ovr: 79, stats: { div: 79, han: 76, kic: 69, ref: 80, spd: 38, pos: 79 } },
      { id: 'ivanusec_m', name: 'Marko Ivanusec', pos: 'CAM', ovr: 75, stats: { pac: 73, sho: 72, pas: 76, dri: 78, def: 39, phy: 58 } }
    ]
  },
  {
    id: 'az_alkmaar',
    name: 'AZ Alkmaar',
    logo: '🔴⚪',
    squad: [
      { id: 'ryan_m', name: 'Mathew Ryan', pos: 'GK', ovr: 77, stats: { div: 77, han: 75, kic: 66, ref: 79, spd: 37, pos: 77 } },
      { id: 'goes_b', name: 'Bruno Martins Indi', pos: 'CB', ovr: 75, stats: { pac: 63, sho: 38, pas: 68, dri: 58, def: 79, phy: 80 } },
      { id: 'clasie_j', name: 'Jordy Clasie', pos: 'CDM', ovr: 74, stats: { pac: 61, sho: 55, pas: 76, dri: 70, def: 76, phy: 68 } },
      { id: 'de_wit_s', name: 'Sven Mijnans', pos: 'CAM', ovr: 76, stats: { pac: 71, sho: 74, pas: 78, dri: 79, def: 40, phy: 58 } },
      { id: 'meerdink_t', name: 'Troy Parrott', pos: 'ST', ovr: 76, stats: { pac: 77, sho: 78, pas: 60, dri: 74, def: 30, phy: 76 } },
      { id: 'karlsson_j', name: 'Jens Odgaard', pos: 'LW', ovr: 74, stats: { pac: 82, sho: 68, pas: 66, dri: 76, def: 27, phy: 63 } },
      { id: 'wolfe_k', name: 'Kees Smit', pos: 'RW', ovr: 73, stats: { pac: 84, sho: 63, pas: 66, dri: 76, def: 26, phy: 54 } },
      { id: 'hatzidiakos_p', name: 'Pantelis Hatzidiakos', pos: 'CB', ovr: 74, stats: { pac: 63, sho: 37, pas: 65, dri: 56, def: 78, phy: 79 } },
      { id: 'van_bommel_r', name: 'Riechedly Bazoer', pos: 'CM', ovr: 74, stats: { pac: 69, sho: 65, pas: 75, dri: 73, def: 60, phy: 65 } },
      { id: 'koopmeiners_s', name: 'Sam Beukema', pos: 'CB', ovr: 76, stats: { pac: 65, sho: 40, pas: 68, dri: 58, def: 80, phy: 82 } },
      { id: 'de_wit_p', name: 'Peer de Wit', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 43, pas: 65, dri: 64, def: 70, phy: 65 } },

      { id: 'owusu_o', name: 'Ostrowski Owusu', pos: 'GK', ovr: 65, stats: { div: 63, han: 62, kic: 53, ref: 66, spd: 31, pos: 65 } },
      { id: 'de_boer_e', name: 'Ernest Poku', pos: 'RW', ovr: 74, stats: { pac: 86, sho: 65, pas: 65, dri: 78, def: 25, phy: 56 } }
    ]
  },
  {
    id: 'club_brugge',
    name: 'Club Brugge',
    logo: '🔵⚫',
    squad: [
      { id: 'mignolet_s', name: 'Simon Mignolet', pos: 'GK', ovr: 80, stats: { div: 80, han: 78, kic: 69, ref: 82, spd: 39, pos: 80 } },
      { id: 'mechele_b', name: 'Brandon Mechele', pos: 'CB', ovr: 77, stats: { pac: 65, sho: 39, pas: 68, dri: 58, def: 80, phy: 82 } },
      { id: 'jashari_a', name: 'Ardon Jashari', pos: 'CM', ovr: 79, stats: { pac: 71, sho: 71, pas: 80, dri: 79, def: 64, phy: 66 } },
      { id: 'nielsen_c', name: 'Christos Tzolis', pos: 'LW', ovr: 78, stats: { pac: 87, sho: 74, pas: 71, dri: 82, def: 29, phy: 60 } },
      { id: 'vetlesen_p', name: 'Philip Zinckernagel', pos: 'RW', ovr: 76, stats: { pac: 83, sho: 71, pas: 74, dri: 79, def: 30, phy: 60 } },
      { id: 'nusa_a', name: 'Antonio Nusa', pos: 'RW', ovr: 78, stats: { pac: 89, sho: 72, pas: 71, dri: 83, def: 28, phy: 61 } },
      { id: 'de_cuyper_m', name: 'Maxim De Cuyper', pos: 'LB', ovr: 76, stats: { pac: 79, sho: 46, pas: 71, dri: 71, def: 74, phy: 66 } },
      { id: 'mechele_2', name: 'Joel Ordonez', pos: 'CB', ovr: 75, stats: { pac: 68, sho: 37, pas: 66, dri: 58, def: 79, phy: 80 } },
      { id: 'sabbe_s', name: 'Sean Klaiber', pos: 'RB', ovr: 73, stats: { pac: 77, sho: 45, pas: 68, dri: 66, def: 72, phy: 67 } },
      { id: 'onyedika_r', name: 'Raphael Onyedika', pos: 'CDM', ovr: 78, stats: { pac: 68, sho: 61, pas: 78, dri: 74, def: 79, phy: 78 } },
      { id: 'nielsen_j', name: 'Nicolas Nkunku', pos: 'ST', ovr: 76, stats: { pac: 77, sho: 78, pas: 60, dri: 74, def: 30, phy: 73 } },

      { id: 'jackers_n', name: 'Nordin Jackers', pos: 'GK', ovr: 70, stats: { div: 68, han: 67, kic: 58, ref: 71, spd: 34, pos: 70 } },
      { id: 'seys_b', name: 'Bjorn Meijer', pos: 'LB', ovr: 72, stats: { pac: 78, sho: 44, pas: 66, dri: 68, def: 71, phy: 64 } }
    ]
  },
  {
    id: 'anderlecht',
    name: 'RSC Anderlecht',
    logo: '🟣⚪',
    squad: [
      { id: 'coosemans_k', name: 'Colin Coosemans', pos: 'GK', ovr: 76, stats: { div: 76, han: 74, kic: 65, ref: 78, spd: 37, pos: 76 } },
      { id: 'sardella_z', name: 'Zeno Debast Jr', pos: 'CB', ovr: 75, stats: { pac: 71, sho: 38, pas: 70, dri: 61, def: 79, phy: 78 } },
      { id: 'kana_j', name: 'Julien Duranville', pos: 'RW', ovr: 76, stats: { pac: 91, sho: 68, pas: 68, dri: 83, def: 26, phy: 55 } },
      { id: 'stroeykens_m', name: 'Mathias Stroeykens', pos: 'CAM', ovr: 75, stats: { pac: 73, sho: 71, pas: 76, dri: 78, def: 40, phy: 56 } },
      { id: 'dolberg_k', name: 'Kasper Dolberg', pos: 'ST', ovr: 76, stats: { pac: 74, sho: 78, pas: 61, dri: 74, def: 30, phy: 74 } },
      { id: 'kadi_a', name: 'Ludwig Augustinsson', pos: 'LB', ovr: 74, stats: { pac: 78, sho: 46, pas: 71, dri: 70, def: 73, phy: 67 } },
      { id: 'huerta_l', name: 'Luis Vazquez', pos: 'ST', ovr: 74, stats: { pac: 75, sho: 75, pas: 58, dri: 72, def: 28, phy: 74 } },
      { id: 'kana_biyik_m', name: 'Mario Stroeykens', pos: 'RB', ovr: 72, stats: { pac: 76, sho: 44, pas: 66, dri: 65, def: 71, phy: 66 } },
      { id: 'moreno_a', name: 'Ashimeru Majeed', pos: 'CM', ovr: 74, stats: { pac: 74, sho: 66, pas: 76, dri: 76, def: 58, phy: 64 } },
      { id: 'vertessen_t', name: 'Thorgan Hazard', pos: 'LW', ovr: 76, stats: { pac: 78, sho: 74, pas: 78, dri: 80, def: 34, phy: 60 } },
      { id: 'delcroix_z', name: 'Zeno Van Den Bosch', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 34, pas: 61, dri: 53, def: 74, phy: 75 } },

      { id: 'verbruggen_b', name: 'Bart Verbruggen Jr', pos: 'GK', ovr: 67, stats: { div: 65, han: 64, kic: 55, ref: 68, spd: 33, pos: 67 } },
      { id: 'yusuf_m', name: 'Majeed Ashimeru', pos: 'CM', ovr: 71, stats: { pac: 70, sho: 62, pas: 71, dri: 70, def: 55, phy: 60 } }
    ]
  },
  {
    id: 'union_sg',
    name: 'Union Saint-Gilloise',
    logo: '⚪🔵',
    squad: [
      { id: 'moris_a', name: 'Anthony Moris', pos: 'GK', ovr: 78, stats: { div: 78, han: 76, kic: 67, ref: 80, spd: 38, pos: 78 } },
      { id: 'burgess_k', name: 'Kevin Mac Allister', pos: 'CB', ovr: 74, stats: { pac: 65, sho: 37, pas: 65, dri: 57, def: 78, phy: 78 } },
      { id: 'sykes_j', name: 'Jonas Sykes', pos: 'CB', ovr: 73, stats: { pac: 62, sho: 35, pas: 62, dri: 55, def: 76, phy: 77 } },
      { id: 'nilsson_v', name: 'Victor Nilsson-Lindelof', pos: 'CDM', ovr: 75, stats: { pac: 64, sho: 56, pas: 75, dri: 68, def: 78, phy: 74 } },
      { id: 'rasmussen_k', name: 'Kevin Rodriguez', pos: 'ST', ovr: 76, stats: { pac: 76, sho: 78, pas: 60, dri: 74, def: 29, phy: 73 } },
      { id: 'sadiki_m', name: 'Mohamed Sadiki', pos: 'RW', ovr: 75, stats: { pac: 86, sho: 68, pas: 68, dri: 79, def: 28, phy: 57 } },
      { id: 'nasser_d', name: 'Nathan Bassalu', pos: 'LB', ovr: 72, stats: { pac: 77, sho: 44, pas: 67, dri: 66, def: 71, phy: 65 } },
      { id: 'ndour_k', name: 'Kamiel Vanheusden', pos: 'CB', ovr: 73, stats: { pac: 62, sho: 36, pas: 63, dri: 55, def: 77, phy: 78 } },
      { id: 'holm_g', name: 'Gustaf Nilsson', pos: 'ST', ovr: 75, stats: { pac: 73, sho: 76, pas: 58, dri: 72, def: 27, phy: 76 } },
      { id: 'lynen_c', name: 'Casper Terho', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 43, pas: 65, dri: 64, def: 70, phy: 65 } },
      { id: 'ohio_m', name: 'Mohammed Fuseini', pos: 'LW', ovr: 74, stats: { pac: 85, sho: 65, pas: 66, dri: 78, def: 27, phy: 56 } },

      { id: 'defourny_j', name: 'Jean Butez', pos: 'GK', ovr: 70, stats: { div: 68, han: 67, kic: 58, ref: 71, spd: 34, pos: 70 } },
      { id: 'teuma_l', name: 'Loic Lapoussin', pos: 'RW', ovr: 72, stats: { pac: 81, sho: 63, pas: 64, dri: 75, def: 26, phy: 53 } }
    ]
  },
  {
    id: 'galatasaray',
    name: 'Galatasaray',
    logo: '🟡🔴',
    squad: [
      { id: 'muslera_f', name: 'Fernando Muslera', pos: 'GK', ovr: 79, stats: { div: 79, han: 77, kic: 68, ref: 81, spd: 38, pos: 79 } },
      { id: 'sanchez_d', name: 'Davinson Sanchez', pos: 'CB', ovr: 78, stats: { pac: 72, sho: 40, pas: 68, dri: 60, def: 81, phy: 82 } },
      { id: 'nelsson_v', name: 'Victor Nelsson', pos: 'CB', ovr: 77, stats: { pac: 69, sho: 39, pas: 66, dri: 58, def: 80, phy: 81 } },
      { id: 'torreira_l', name: 'Lucas Torreira', pos: 'CDM', ovr: 80, stats: { pac: 68, sho: 63, pas: 79, dri: 76, def: 81, phy: 74 } },
      { id: 'sara_k', name: 'Kerem Akturkoglu2', pos: 'LW', ovr: 78, stats: { pac: 84, sho: 73, pas: 74, dri: 81, def: 32, phy: 61 } },
      { id: 'icardi_m', name: 'Mauro Icardi', pos: 'ST', ovr: 82, stats: { pac: 74, sho: 85, pas: 63, dri: 78, def: 33, phy: 78 } },
      { id: 'zaha_w', name: 'Wilfried Zaha', pos: 'RW', ovr: 79, stats: { pac: 87, sho: 74, pas: 74, dri: 84, def: 30, phy: 65 } },
      { id: 'yilmaz_b', name: 'Barış Alper Yılmaz', pos: 'RW', ovr: 78, stats: { pac: 90, sho: 72, pas: 70, dri: 81, def: 30, phy: 63 } },
      { id: 'aktürkoğlu_k', name: 'Yunus Akgun', pos: 'CAM', ovr: 76, stats: { pac: 78, sho: 71, pas: 76, dri: 79, def: 36, phy: 58 } },
      { id: 'sara_2', name: 'Sacha Boey', pos: 'RB', ovr: 77, stats: { pac: 86, sho: 47, pas: 71, dri: 74, def: 74, phy: 68 } },
      { id: 'kutlu_a', name: 'Abdulkerim Bardakci', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 37, pas: 65, dri: 57, def: 77, phy: 78 } },

      { id: 'gunay_o', name: 'Gunay Guvenc', pos: 'GK', ovr: 68, stats: { div: 66, han: 65, kic: 56, ref: 69, spd: 33, pos: 68 } },
      { id: 'sara_3', name: 'Kaan Ayhan', pos: 'CB', ovr: 75, stats: { pac: 65, sho: 38, pas: 66, dri: 58, def: 78, phy: 79 } }
    ]
  },
  {
    id: 'fenerbahce',
    name: 'Fenerbahce',
    logo: '🟡🔵',
    squad: [
      { id: 'ederson_e', name: 'Ederson Moraes Jr', pos: 'GK', ovr: 79, stats: { div: 79, han: 77, kic: 69, ref: 81, spd: 38, pos: 79 } },
      { id: 'djiku_a', name: 'Alexander Djiku', pos: 'CB', ovr: 77, stats: { pac: 68, sho: 39, pas: 67, dri: 58, def: 80, phy: 81 } },
      { id: 'oosterwolde_j', name: 'Jayden Oosterwolde', pos: 'LB', ovr: 76, stats: { pac: 80, sho: 46, pas: 71, dri: 71, def: 74, phy: 67 } },
      { id: 'fred_r', name: 'Fred', pos: 'CDM', ovr: 79, stats: { pac: 68, sho: 62, pas: 79, dri: 76, def: 80, phy: 75 } },
      { id: 'tadic_d', name: 'Dusan Tadic', pos: 'CAM', ovr: 82, stats: { pac: 65, sho: 79, pas: 86, dri: 84, def: 44, phy: 64 } },
      { id: 'dzeko_e', name: 'Edin Dzeko', pos: 'ST', ovr: 82, stats: { pac: 66, sho: 84, pas: 68, dri: 76, def: 34, phy: 82 } },
      { id: 'kerem_a', name: 'Cengiz Under', pos: 'RW', ovr: 78, stats: { pac: 85, sho: 74, pas: 74, dri: 82, def: 30, phy: 60 } },
      { id: 'szymanski_s', name: 'Sebastian Szymanski', pos: 'CM', ovr: 79, stats: { pac: 72, sho: 74, pas: 80, dri: 80, def: 62, phy: 62 } },
      { id: 'nene_c', name: 'Irfan Can Kahveci', pos: 'CAM', ovr: 76, stats: { pac: 74, sho: 71, pas: 77, dri: 78, def: 38, phy: 56 } },
      { id: 'osayi_o', name: 'Bright Osayi-Samuel', pos: 'RB', ovr: 76, stats: { pac: 85, sho: 48, pas: 71, dri: 72, def: 73, phy: 67 } },
      { id: 'saracchi_g', name: 'Amrabat Sofyan2', pos: 'CDM', ovr: 78, stats: { pac: 69, sho: 60, pas: 76, dri: 73, def: 82, phy: 78 } },

      { id: 'irfan_e', name: 'Irfan Egribayat', pos: 'GK', ovr: 68, stats: { div: 66, han: 65, kic: 56, ref: 69, spd: 33, pos: 68 } },
      { id: 'sara_4', name: 'Bright Osayi-Samuel2', pos: 'RW', ovr: 74, stats: { pac: 84, sho: 65, pas: 66, dri: 77, def: 27, phy: 55 } }
    ]
  },
  {
    id: 'besiktas',
    name: 'Besiktas',
    logo: '⚫⚪',
    squad: [
      { id: 'ersin_d', name: 'Ersin Destanoglu', pos: 'GK', ovr: 77, stats: { div: 77, han: 75, kic: 66, ref: 79, spd: 37, pos: 77 } },
      { id: 'gedson_f', name: 'Gedson Fernandes', pos: 'CM', ovr: 77, stats: { pac: 74, sho: 70, pas: 78, dri: 78, def: 65, phy: 71 } },
      { id: 'uduokhai_f', name: 'Felix Uduokhai', pos: 'CB', ovr: 76, stats: { pac: 68, sho: 38, pas: 67, dri: 58, def: 79, phy: 81 } },
      { id: 'rashica_m', name: 'Milot Rashica', pos: 'LW', ovr: 76, stats: { pac: 86, sho: 71, pas: 70, dri: 80, def: 28, phy: 59 } },
      { id: 'aboubakar_v', name: 'Vincent Aboubakar', pos: 'ST', ovr: 78, stats: { pac: 74, sho: 79, pas: 62, dri: 75, def: 30, phy: 79 } },
      { id: 'ndidi_w', name: 'Wilfred Ndidi', pos: 'CDM', ovr: 77, stats: { pac: 68, sho: 55, pas: 73, dri: 68, def: 81, phy: 79 } },
      { id: 'muleka_c', name: 'Cyle Larin', pos: 'ST', ovr: 76, stats: { pac: 77, sho: 78, pas: 58, dri: 73, def: 29, phy: 76 } },
      { id: 'masuaku_a', name: 'Arthur Masuaku', pos: 'LB', ovr: 74, stats: { pac: 77, sho: 46, pas: 69, dri: 69, def: 72, phy: 66 } },
      { id: 'necip_u', name: 'Necip Uysal', pos: 'RB', ovr: 72, stats: { pac: 74, sho: 43, pas: 65, dri: 63, def: 71, phy: 66 } },
      { id: 'ismail_j', name: 'Jean Onana', pos: 'CDM', ovr: 74, stats: { pac: 66, sho: 55, pas: 73, dri: 66, def: 77, phy: 76 } },
      { id: 'tosun_c', name: 'Cenk Tosun', pos: 'ST', ovr: 74, stats: { pac: 68, sho: 76, pas: 58, dri: 71, def: 28, phy: 76 } },

      { id: 'mert_g', name: 'Mert Gunok', pos: 'GK', ovr: 76, stats: { div: 76, han: 74, kic: 65, ref: 78, spd: 36, pos: 76 } },
      { id: 'sara_5', name: 'Alex Teixeira', pos: 'CAM', ovr: 74, stats: { pac: 71, sho: 73, pas: 76, dri: 78, def: 36, phy: 58 } }
    ]
  },
  {
    id: 'trabzonspor',
    name: 'Trabzonspor',
    logo: '🟣🔵',
    squad: [
      { id: 'ugurcan_c', name: 'Ugurcan Cakir', pos: 'GK', ovr: 81, stats: { div: 81, han: 79, kic: 71, ref: 83, spd: 40, pos: 81 } },
      { id: 'bakasetas_a', name: 'Anastasios Bakasetas', pos: 'CAM', ovr: 77, stats: { pac: 71, sho: 76, pas: 78, dri: 78, def: 40, phy: 60 } },
      { id: 'folcarelli_e', name: 'Enis Bardhi', pos: 'CM', ovr: 76, stats: { pac: 68, sho: 72, pas: 78, dri: 77, def: 58, phy: 62 } },
      { id: 'onuachu_p', name: 'Paul Onuachu', pos: 'ST', ovr: 77, stats: { pac: 66, sho: 79, pas: 55, dri: 68, def: 28, phy: 85 } },
      { id: 'nwakaeme_a', name: 'Anthony Nwakaeme', pos: 'RW', ovr: 75, stats: { pac: 82, sho: 71, pas: 68, dri: 78, def: 27, phy: 62 } },
      { id: 'savic_s', name: 'Stefan Savic', pos: 'CB', ovr: 76, stats: { pac: 62, sho: 39, pas: 66, dri: 56, def: 80, phy: 82 } },
      { id: 'bakır_d', name: 'Denswil Ridgeciano', pos: 'CB', ovr: 74, stats: { pac: 63, sho: 37, pas: 64, dri: 55, def: 78, phy: 80 } },
      { id: 'hosokawa_e', name: 'Edin Visca', pos: 'LW', ovr: 74, stats: { pac: 80, sho: 68, pas: 68, dri: 77, def: 26, phy: 56 } },
      { id: 'bakır_h', name: 'Marc Bartra', pos: 'CB', ovr: 75, stats: { pac: 64, sho: 38, pas: 68, dri: 58, def: 79, phy: 78 } },
      { id: 'folcarelli_2', name: 'Trezeguet', pos: 'LW', ovr: 76, stats: { pac: 84, sho: 71, pas: 69, dri: 79, def: 27, phy: 60 } },
      { id: 'yusuf_e', name: 'Yusuf Erdoğan', pos: 'RB', ovr: 71, stats: { pac: 74, sho: 42, pas: 64, dri: 63, def: 70, phy: 65 } },

      { id: 'ugurcan_2', name: 'Erce Kardeşler', pos: 'GK', ovr: 65, stats: { div: 63, han: 62, kic: 53, ref: 66, spd: 31, pos: 65 } },
      { id: 'bakasetas_2', name: 'Umut Bozok', pos: 'ST', ovr: 71, stats: { pac: 71, sho: 74, pas: 55, dri: 68, def: 26, phy: 74 } }
    ]
  },
  {
    id: 'young_boys',
    name: 'BSC Young Boys',
    logo: '🟡⚫',
    squad: [
      { id: 'faivre_m', name: 'Marvin Keller', pos: 'GK', ovr: 76, stats: { div: 76, han: 74, kic: 65, ref: 78, spd: 37, pos: 76 } },
      { id: 'lauper_f', name: 'Fabian Lustenberger', pos: 'CB', ovr: 74, stats: { pac: 61, sho: 38, pas: 66, dri: 55, def: 78, phy: 80 } },
      { id: 'itten_j', name: 'Jordan Siebatcheu', pos: 'ST', ovr: 76, stats: { pac: 73, sho: 78, pas: 58, dri: 73, def: 29, phy: 79 } },
      { id: 'ugrinic_f', name: 'Filip Ugrinic', pos: 'CM', ovr: 76, stats: { pac: 71, sho: 70, pas: 78, dri: 77, def: 61, phy: 64 } },
      { id: 'monteiro_m', name: 'Meschack Elia', pos: 'LW', ovr: 76, stats: { pac: 87, sho: 68, pas: 68, dri: 80, def: 27, phy: 58 } },
      { id: 'rieder_c', name: 'Christian Fassnacht', pos: 'RW', ovr: 75, stats: { pac: 81, sho: 71, pas: 73, dri: 78, def: 30, phy: 60 } },
      { id: 'ganvoula_s', name: 'Silvère Ganvoula', pos: 'ST', ovr: 74, stats: { pac: 75, sho: 75, pas: 57, dri: 72, def: 27, phy: 74 } },
      { id: 'lefort_c', name: 'Lewin Blum', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 43, pas: 65, dri: 64, def: 70, phy: 65 } },
      { id: 'camara_m', name: 'Mohamed Camara', pos: 'CDM', ovr: 75, stats: { pac: 65, sho: 55, pas: 74, dri: 68, def: 78, phy: 74 } },
      { id: 'zesiger_g', name: 'Cedric Zesiger', pos: 'CB', ovr: 73, stats: { pac: 61, sho: 36, pas: 64, dri: 54, def: 77, phy: 78 } },
      { id: 'martins_j', name: 'Joel Monteiro', pos: 'LB', ovr: 71, stats: { pac: 77, sho: 43, pas: 63, dri: 65, def: 69, phy: 63 } },

      { id: 'racioppi_a', name: 'Anthony Racioppi', pos: 'GK', ovr: 66, stats: { div: 64, han: 63, kic: 54, ref: 67, spd: 32, pos: 66 } },
      { id: 'colley_j', name: 'Saidy Janko', pos: 'RB', ovr: 70, stats: { pac: 74, sho: 41, pas: 62, dri: 62, def: 68, phy: 63 } }
    ]
  },
  {
    id: 'fc_basel',
    name: 'FC Basel',
    logo: '🔵🔴',
    squad: [
      { id: 'lindner_m', name: 'Marwin Hitz', pos: 'GK', ovr: 75, stats: { div: 75, han: 73, kic: 64, ref: 77, spd: 36, pos: 75 } },
      { id: 'pelivan_j', name: 'Andy Pelmard', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 37, pas: 65, dri: 56, def: 78, phy: 79 } },
      { id: 'burger_a', name: 'Anton Kade', pos: 'CAM', ovr: 75, stats: { pac: 72, sho: 71, pas: 76, dri: 78, def: 38, phy: 55 } },
      { id: 'amdouni_z', name: 'Zeki Amdouni Jr', pos: 'ST', ovr: 76, stats: { pac: 78, sho: 77, pas: 59, dri: 74, def: 28, phy: 71 } },
      { id: 'cham_a', name: 'Albian Ajeti', pos: 'ST', ovr: 74, stats: { pac: 75, sho: 75, pas: 58, dri: 72, def: 27, phy: 73 } },
      { id: 'esposito_s', name: 'Sebastiano Esposito', pos: 'ST', ovr: 75, stats: { pac: 76, sho: 76, pas: 60, dri: 74, def: 27, phy: 68 } },
      { id: 'xhaka_t', name: 'Taulant Xhaka', pos: 'CDM', ovr: 74, stats: { pac: 63, sho: 53, pas: 72, dri: 66, def: 76, phy: 71 } },
      { id: 'salah_e', name: 'Fabian Frei', pos: 'CM', ovr: 73, stats: { pac: 60, sho: 65, pas: 76, dri: 71, def: 62, phy: 62 } },
      { id: 'adjei_k', name: 'Kevin Carlos', pos: 'RW', ovr: 73, stats: { pac: 83, sho: 63, pas: 65, dri: 76, def: 26, phy: 53 } },
      { id: 'salihi_m', name: 'Michael Lang', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 43, pas: 65, dri: 64, def: 70, phy: 66 } },
      { id: 'stocker_j', name: 'Jonas Adjetey', pos: 'LB', ovr: 70, stats: { pac: 74, sho: 41, pas: 62, dri: 62, def: 68, phy: 63 } },

      { id: 'hitz_d', name: 'Djordje Nikolic', pos: 'GK', ovr: 65, stats: { div: 63, han: 62, kic: 53, ref: 66, spd: 31, pos: 65 } },
      { id: 'pelivan_2', name: 'Leo Lacroix', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 35, pas: 63, dri: 55, def: 75, phy: 77 } }
    ]
  },
  {
    id: 'fc_zurich',
    name: 'FC Zurich',
    logo: '🔵⚪',
    squad: [
      { id: 'brecher_y', name: 'Yanick Brecher', pos: 'GK', ovr: 74, stats: { div: 74, han: 72, kic: 63, ref: 76, spd: 35, pos: 74 } },
      { id: 'kryeziu_b', name: 'Becir Omeragic', pos: 'CB', ovr: 74, stats: { pac: 66, sho: 37, pas: 65, dri: 57, def: 77, phy: 78 } },
      { id: 'krasniqi_a', name: 'Antonio Marchesano', pos: 'CAM', ovr: 74, stats: { pac: 71, sho: 70, pas: 75, dri: 77, def: 37, phy: 55 } },
      { id: 'sohm_j', name: 'Jonathan Okita', pos: 'RW', ovr: 74, stats: { pac: 84, sho: 64, pas: 66, dri: 77, def: 26, phy: 54 } },
      { id: 'guerrero_m', name: 'Mirlind Kryeziu', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 34, pas: 60, dri: 53, def: 74, phy: 75 } },
      { id: 'kramer_b', name: 'Bledian Krasniqi', pos: 'CDM', ovr: 71, stats: { pac: 61, sho: 51, pas: 70, dri: 63, def: 74, phy: 68 } },
      { id: 'boranijasevic_i', name: 'Ivan Santini', pos: 'ST', ovr: 73, stats: { pac: 70, sho: 75, pas: 55, dri: 69, def: 26, phy: 78 } },
      { id: 'kamberi_s', name: 'Blerim Dzemaili Jr', pos: 'CM', ovr: 71, stats: { pac: 62, sho: 61, pas: 71, dri: 68, def: 55, phy: 60 } },
      { id: 'domgjoni_d', name: 'Nikola Boranijasevic', pos: 'RB', ovr: 70, stats: { pac: 74, sho: 42, pas: 63, dri: 62, def: 68, phy: 63 } },
      { id: 'katic_t', name: 'Toni Domgjoni', pos: 'LB', ovr: 69, stats: { pac: 73, sho: 41, pas: 61, dri: 61, def: 66, phy: 61 } },
      { id: 'rohner_s', name: 'Stephane Rohner', pos: 'LW', ovr: 69, stats: { pac: 80, sho: 59, pas: 61, dri: 71, def: 24, phy: 50 } },

      { id: 'brecher_2', name: 'Kevin Peng', pos: 'GK', ovr: 60, stats: { div: 58, han: 57, kic: 48, ref: 61, spd: 27, pos: 60 } },
      { id: 'krasniqi_2', name: 'Antonio Marchesano2', pos: 'CM', ovr: 65, stats: { pac: 61, sho: 56, pas: 66, dri: 63, def: 53, phy: 56 } }
    ]
  },
  {
    id: 'inter_miami',
    name: 'Inter Miami CF',
    logo: '🩷⚫',
    squad: [
      { id: 'callender_d', name: 'Drake Callender', pos: 'GK', ovr: 78, stats: { div: 78, han: 76, kic: 67, ref: 80, spd: 38, pos: 78 } },
      { id: 'alba_j', name: 'Jordi Alba', pos: 'LB', ovr: 82, stats: { pac: 78, sho: 55, pas: 82, dri: 80, def: 76, phy: 65 } },
      { id: 'busquets_s', name: 'Sergio Busquets', pos: 'CDM', ovr: 82, stats: { pac: 48, sho: 65, pas: 87, dri: 79, def: 79, phy: 68 } },
      { id: 'messi_l', name: 'Lionel Messi', pos: 'RW', ovr: 90, stats: { pac: 79, sho: 89, pas: 90, dri: 94, def: 34, phy: 62 }, altPos: ['CAM'] },
      { id: 'suarez_l', name: 'Luis Suarez', pos: 'ST', ovr: 82, stats: { pac: 68, sho: 85, pas: 76, dri: 82, def: 38, phy: 76 } },
      { id: 'segovia_b', name: 'Benjamin Cremaschi', pos: 'CM', ovr: 74, stats: { pac: 71, sho: 66, pas: 76, dri: 74, def: 59, phy: 62 } },
      { id: 'aviles_n', name: 'Noah Allen', pos: 'RB', ovr: 71, stats: { pac: 76, sho: 42, pas: 65, dri: 63, def: 69, phy: 65 } },
      { id: 'weigandt_j', name: 'Julian Gressel', pos: 'RB', ovr: 74, stats: { pac: 74, sho: 47, pas: 71, dri: 68, def: 71, phy: 66 } },
      { id: 'falcon_y', name: 'Yannick Bright', pos: 'CDM', ovr: 72, stats: { pac: 63, sho: 52, pas: 71, dri: 65, def: 74, phy: 70 } },
      { id: 'redondo_f', name: 'Federico Redondo', pos: 'CM', ovr: 75, stats: { pac: 68, sho: 68, pas: 77, dri: 75, def: 60, phy: 64 } },
      { id: 'ruiz_d', name: 'David Ruiz', pos: 'CB', ovr: 72, stats: { pac: 63, sho: 36, pas: 63, dri: 55, def: 75, phy: 76 } },

      { id: 'ustari_o', name: 'Oscar Ustari', pos: 'GK', ovr: 66, stats: { div: 64, han: 63, kic: 54, ref: 67, spd: 32, pos: 66 } },
      { id: 'taylor_t', name: 'Tomas Aviles', pos: 'CB', ovr: 71, stats: { pac: 61, sho: 34, pas: 60, dri: 53, def: 74, phy: 75 } }
    ]
  },
  {
    id: 'lafc',
    name: 'Los Angeles FC',
    logo: '⚫🟡',
    squad: [
      { id: 'crepeau_m', name: 'Maxime Crepeau', pos: 'GK', ovr: 78, stats: { div: 78, han: 76, kic: 67, ref: 80, spd: 38, pos: 78 } },
      { id: 'long_a', name: 'Aaron Long', pos: 'CB', ovr: 75, stats: { pac: 63, sho: 38, pas: 65, dri: 56, def: 78, phy: 80 } },
      { id: 'palencia_j', name: 'Jesus Murillo', pos: 'CB', ovr: 74, stats: { pac: 64, sho: 37, pas: 64, dri: 56, def: 77, phy: 79 } },
      { id: 'bouanga_d', name: 'Denis Bouanga', pos: 'LW', ovr: 82, stats: { pac: 90, sho: 80, pas: 72, dri: 85, def: 30, phy: 62 } },
      { id: 'cifuentes_j', name: 'Jose Cifuentes', pos: 'CM', ovr: 76, stats: { pac: 71, sho: 68, pas: 78, dri: 77, def: 61, phy: 63 } },
      { id: 'giroud_o', name: 'Olivier Giroud', pos: 'ST', ovr: 80, stats: { pac: 62, sho: 82, pas: 68, dri: 74, def: 34, phy: 82 } },
      { id: 'blessing_a', name: 'Nathan Ordaz', pos: 'RW', ovr: 74, stats: { pac: 84, sho: 66, pas: 66, dri: 78, def: 27, phy: 55 } },
      { id: 'hollingshead_r', name: 'Ryan Hollingshead', pos: 'LB', ovr: 74, stats: { pac: 76, sho: 45, pas: 69, dri: 66, def: 72, phy: 67 } },
      { id: 'palencia_2', name: 'Aaron Herrera', pos: 'RB', ovr: 73, stats: { pac: 77, sho: 44, pas: 67, dri: 65, def: 71, phy: 66 } },
      { id: 'delgado_e', name: 'Eddie Segura', pos: 'CB', ovr: 73, stats: { pac: 62, sho: 35, pas: 62, dri: 54, def: 76, phy: 78 } },
      { id: 'rodriguez_i', name: 'Ilie Sanchez', pos: 'CDM', ovr: 74, stats: { pac: 60, sho: 53, pas: 75, dri: 68, def: 76, phy: 70 } },

      { id: 'castellanos_j', name: 'John McCarthy', pos: 'GK', ovr: 68, stats: { div: 66, han: 65, kic: 56, ref: 69, spd: 33, pos: 68 } },
      { id: 'kaye_m', name: 'Mark-Anthony Kaye', pos: 'CM', ovr: 72, stats: { pac: 67, sho: 62, pas: 72, dri: 70, def: 58, phy: 64 } }
    ]
  },
  {
    id: 'lagalaxy',
    name: 'LA Galaxy',
    logo: '⚪🔵',
    squad: [
      { id: 'bond_j', name: 'John McCarthy2', pos: 'GK', ovr: 74, stats: { div: 74, han: 72, kic: 63, ref: 76, spd: 36, pos: 74 } },
      { id: 'puig_r', name: 'Riqui Puig', pos: 'CAM', ovr: 79, stats: { pac: 68, sho: 74, pas: 82, dri: 82, def: 45, phy: 58 } },
      { id: 'vela_j', name: 'Joseph Paintsil', pos: 'RW', ovr: 78, stats: { pac: 87, sho: 74, pas: 71, dri: 80, def: 28, phy: 61 } },
      { id: 'dunbar_g', name: 'Gabriel Pec', pos: 'LW', ovr: 76, stats: { pac: 85, sho: 71, pas: 70, dri: 79, def: 27, phy: 58 } },
      { id: 'ramirez_c', name: 'Christian Ramirez', pos: 'ST', ovr: 74, stats: { pac: 74, sho: 76, pas: 57, dri: 71, def: 27, phy: 76 } },
      { id: 'segura_e', name: 'Eriq Zavaleta', pos: 'CB', ovr: 73, stats: { pac: 62, sho: 36, pas: 63, dri: 55, def: 76, phy: 78 } },
      { id: 'araujo_j', name: 'Julian Araujo', pos: 'RB', ovr: 76, stats: { pac: 85, sho: 47, pas: 71, dri: 72, def: 73, phy: 66 } },
      { id: 'delgado_m', name: 'Maya Yoshida', pos: 'CB', ovr: 74, stats: { pac: 60, sho: 38, pas: 66, dri: 55, def: 78, phy: 80 } },
      { id: 'raposo_m', name: 'Mark Delgado', pos: 'CDM', ovr: 72, stats: { pac: 63, sho: 52, pas: 72, dri: 65, def: 74, phy: 69 } },
      { id: 'segura_2', name: 'Miki Yamane2', pos: 'LB', ovr: 71, stats: { pac: 74, sho: 42, pas: 64, dri: 63, def: 69, phy: 63 } },
      { id: 'zambrano_j', name: 'Diego Fagundez', pos: 'CM', ovr: 72, stats: { pac: 69, sho: 65, pas: 73, dri: 72, def: 56, phy: 58 } },

      { id: 'chavez_j', name: 'Jonathan Klinsmann', pos: 'GK', ovr: 68, stats: { div: 66, han: 65, kic: 56, ref: 69, spd: 33, pos: 68 } },
      { id: 'vera_e', name: 'Edwin Cerrillo', pos: 'CM', ovr: 71, stats: { pac: 66, sho: 61, pas: 71, dri: 69, def: 57, phy: 60 } }
    ]
  },
  {
    id: 'seattle_sounders',
    name: 'Seattle Sounders FC',
    logo: '🟢🔵',
    squad: [
      { id: 'frei_s', name: 'Stefan Frei', pos: 'GK', ovr: 79, stats: { div: 79, han: 77, kic: 68, ref: 81, spd: 38, pos: 79 } },
      { id: 'roldan_c', name: 'Cristian Roldan', pos: 'CM', ovr: 76, stats: { pac: 72, sho: 68, pas: 77, dri: 76, def: 63, phy: 64 } },
      { id: 'ruidiaz_r', name: 'Raul Ruidiaz', pos: 'ST', ovr: 77, stats: { pac: 73, sho: 79, pas: 60, dri: 75, def: 28, phy: 71 } },
      { id: 'morris_j', name: 'Jordan Morris', pos: 'LW', ovr: 76, stats: { pac: 86, sho: 71, pas: 68, dri: 78, def: 28, phy: 66 } },
      { id: 'atencio_o', name: 'Obed Vargas', pos: 'CDM', ovr: 74, stats: { pac: 66, sho: 55, pas: 74, dri: 68, def: 76, phy: 72 } },
      { id: 'rowe_p', name: 'Paul Rothrock', pos: 'RW', ovr: 73, stats: { pac: 83, sho: 63, pas: 65, dri: 76, def: 26, phy: 54 } },
      { id: 'ragen_y', name: 'Yeimar Gomez', pos: 'CB', ovr: 75, stats: { pac: 66, sho: 38, pas: 65, dri: 57, def: 79, phy: 81 } },
      { id: 'leerdam_n', name: 'Nouhou Tolo', pos: 'LB', ovr: 73, stats: { pac: 76, sho: 43, pas: 65, dri: 65, def: 71, phy: 66 } },
      { id: 'kim_j', name: 'Jackson Ragen', pos: 'CB', ovr: 72, stats: { pac: 62, sho: 35, pas: 62, dri: 54, def: 75, phy: 77 } },
      { id: 'arreaga_j', name: 'Alex Roldan', pos: 'RB', ovr: 73, stats: { pac: 74, sho: 43, pas: 65, dri: 63, def: 71, phy: 65 } },
      { id: 'cain_j', name: 'Danny Musovski', pos: 'ST', ovr: 71, stats: { pac: 78, sho: 71, pas: 55, dri: 70, def: 26, phy: 67 } },

      { id: 'frei_2', name: 'Andrew Thomas', pos: 'GK', ovr: 63, stats: { div: 61, han: 60, kic: 51, ref: 64, spd: 29, pos: 63 } },
      { id: 'roldan_2', name: 'Josh Atencio', pos: 'CDM', ovr: 71, stats: { pac: 64, sho: 51, pas: 71, dri: 64, def: 74, phy: 68 } }
    ]
  },
  {
    id: 'fc_cincinnati',
    name: 'FC Cincinnati',
    logo: '🔵🟠',
    squad: [
      { id: 'celentano_r', name: 'Roman Celentano', pos: 'GK', ovr: 76, stats: { div: 76, han: 74, kic: 65, ref: 78, spd: 37, pos: 76 } },
      { id: 'acosta_l', name: 'Luciano Acosta', pos: 'CAM', ovr: 82, stats: { pac: 74, sho: 78, pas: 84, dri: 85, def: 42, phy: 58 } },
      { id: 'sittampalam_e', name: 'Evander', pos: 'RW', ovr: 80, stats: { pac: 79, sho: 78, pas: 80, dri: 82, def: 35, phy: 60 } },
      { id: 'santos_a', name: 'Aaron Boupendza', pos: 'ST', ovr: 75, stats: { pac: 78, sho: 77, pas: 58, dri: 74, def: 27, phy: 72 } },
      { id: 'miazga_m', name: 'Matt Miazga', pos: 'CB', ovr: 75, stats: { pac: 63, sho: 38, pas: 65, dri: 56, def: 78, phy: 80 } },
      { id: 'yedlin_d', name: 'DeAndre Yedlin', pos: 'RB', ovr: 74, stats: { pac: 82, sho: 44, pas: 68, dri: 66, def: 71, phy: 65 } },
      { id: 'kubo_y', name: 'Yuya Kubo', pos: 'ST', ovr: 73, stats: { pac: 74, sho: 73, pas: 58, dri: 71, def: 27, phy: 69 } },
      { id: 'nwobodo_o', name: 'Obinna Nwobodo', pos: 'CDM', ovr: 74, stats: { pac: 63, sho: 53, pas: 73, dri: 66, def: 77, phy: 74 } },
      { id: 'hagglund_n', name: 'Nick Hagglund', pos: 'CB', ovr: 72, stats: { pac: 61, sho: 35, pas: 62, dri: 54, def: 75, phy: 77 } },
      { id: 'ofori_a', name: 'Alvas Powell', pos: 'LB', ovr: 71, stats: { pac: 76, sho: 42, pas: 63, dri: 62, def: 69, phy: 63 } },
      { id: 'gaddis_a', name: 'Arquimides Ordonez', pos: 'LW', ovr: 72, stats: { pac: 83, sho: 62, pas: 64, dri: 76, def: 26, phy: 53 } },

      { id: 'stull_e', name: 'Evan Louro', pos: 'GK', ovr: 65, stats: { div: 63, han: 62, kic: 53, ref: 66, spd: 31, pos: 65 } },
      { id: 'moore_c', name: 'Corey Moore', pos: 'RB', ovr: 68, stats: { pac: 78, sho: 39, pas: 60, dri: 60, def: 65, phy: 61 } }
    ]
  },
  {
    id: 'nycfc',
    name: 'New York City FC',
    logo: '🔵🟠',
    squad: [
      { id: 'brown_m', name: 'Matt Freese', pos: 'GK', ovr: 76, stats: { div: 76, han: 74, kic: 65, ref: 78, spd: 37, pos: 76 } },
      { id: 'martinez_s', name: 'Santiago Rodriguez', pos: 'CAM', ovr: 76, stats: { pac: 73, sho: 73, pas: 78, dri: 79, def: 39, phy: 56 } },
      { id: 'mitrita_a', name: 'Alonzo Coleman', pos: 'RB', ovr: 71, stats: { pac: 75, sho: 42, pas: 64, dri: 63, def: 69, phy: 64 } },
      { id: 'hines_ike_t', name: 'Talles Magno', pos: 'LW', ovr: 76, stats: { pac: 86, sho: 71, pas: 69, dri: 80, def: 27, phy: 57 } },
      { id: 'sands_j', name: 'James Sands', pos: 'CB', ovr: 75, stats: { pac: 65, sho: 38, pas: 68, dri: 58, def: 78, phy: 78 } },
      { id: 'chanot_a', name: 'Alexander Callens', pos: 'CB', ovr: 74, stats: { pac: 63, sho: 37, pas: 65, dri: 56, def: 77, phy: 79 } },
      { id: 'moralez_m', name: 'Maxi Moralez', pos: 'CM', ovr: 74, stats: { pac: 60, sho: 68, pas: 78, dri: 76, def: 55, phy: 55 } },
      { id: 'ramirez_j', name: 'Julian Fernandez', pos: 'ST', ovr: 73, stats: { pac: 76, sho: 74, pas: 58, dri: 72, def: 27, phy: 68 } },
      { id: 'gray_g', name: 'Gabriel Pereira', pos: 'RW', ovr: 74, stats: { pac: 83, sho: 65, pas: 68, dri: 78, def: 27, phy: 56 } },
      { id: 'tinnerholm_j', name: 'Joel Waterman', pos: 'LB', ovr: 71, stats: { pac: 74, sho: 41, pas: 63, dri: 62, def: 68, phy: 63 } },
      { id: 'bruno_t', name: 'Thiago Andrade', pos: 'RW', ovr: 72, stats: { pac: 82, sho: 62, pas: 64, dri: 75, def: 26, phy: 52 } },

      { id: 'johnson_j', name: 'Jasper Loeffelsend', pos: 'GK', ovr: 63, stats: { div: 61, han: 60, kic: 51, ref: 64, spd: 29, pos: 63 } },
      { id: 'chanot_2', name: 'Keaton Parks', pos: 'CM', ovr: 71, stats: { pac: 65, sho: 61, pas: 71, dri: 68, def: 57, phy: 60 } }
    ]
  },
];
module.exports = { INITIAL_TEAMS };
