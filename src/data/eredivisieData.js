// Eredivisie: 18 klub va ularning barcha o'yinchilari (reyting jadvallaridan).
// Mavjud klublar (ajax, psv, feyenoord, az_alkmaar) uchun faqat tarkib almashtiriladi, qolganlari qo'shiladi.
const EREDIVISIE_TEAMS = [
 {
  "id": "ajax",
  "squad": [
   {
    "id": "stegen_m",
    "name": "Marc-André ter Stegen",
    "nat": "Germany",
    "pos": "GK",
    "ovr": 82,
    "stats": {
     "div": 81,
     "han": 82,
     "kic": 85,
     "ref": 82,
     "spd": 44,
     "pos": 81
    }
   },
   {
    "id": "brandt_j",
    "name": "Julian Brandt",
    "nat": "Germany",
    "pos": "CAM",
    "ovr": 82,
    "stats": {
     "pac": 69,
     "sho": 77,
     "pas": 83,
     "dri": 84,
     "def": 43,
     "phy": 69
    }
   },
   {
    "id": "baas_y",
    "name": "Youri Baas",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 78,
    "stats": {
     "pac": 73,
     "sho": 41,
     "pas": 72,
     "dri": 74,
     "def": 79,
     "phy": 73
    }
   },
   {
    "id": "leonardo_m",
    "name": "Marcos Leonardo",
    "nat": "Brazil",
    "pos": "ST",
    "ovr": 78,
    "stats": {
     "pac": 77,
     "sho": 77,
     "pas": 60,
     "dri": 73,
     "def": 27,
     "phy": 66
    }
   },
   {
    "id": "henrique_c",
    "name": "Calo Henrique",
    "nat": "Brazil",
    "pos": "LB",
    "ovr": 77,
    "stats": {
     "pac": 77,
     "sho": 58,
     "pas": 77,
     "dri": 77,
     "def": 72,
     "phy": 66
    }
   },
   {
    "id": "dolberg_k",
    "name": "Kasper Dolberg",
    "nat": "Denmark",
    "pos": "ST",
    "ovr": 77,
    "stats": {
     "pac": 68,
     "sho": 78,
     "pas": 66,
     "dri": 75,
     "def": 30,
     "phy": 67
    }
   },
   {
    "id": "gloukh_o",
    "name": "Oscar Gloukh",
    "nat": "Israel",
    "pos": "CAM",
    "ovr": 77,
    "stats": {
     "pac": 72,
     "sho": 74,
     "pas": 73,
     "dri": 82,
     "def": 34,
     "phy": 49
    }
   },
   {
    "id": "klaassen_d",
    "name": "Davy Klaassen",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 76,
    "stats": {
     "pac": 41,
     "sho": 77,
     "pas": 72,
     "dri": 70,
     "def": 74,
     "phy": 73
    }
   },
   {
    "id": "berghuis_s",
    "name": "Steven Berghuis",
    "nat": "Netherlands",
    "pos": "RW",
    "ovr": 76,
    "stats": {
     "pac": 62,
     "sho": 75,
     "pas": 84,
     "dri": 76,
     "def": 42,
     "phy": 66
    }
   },
   {
    "id": "blind_d",
    "name": "Daley Blind",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 75,
    "stats": {
     "pac": 34,
     "sho": 62,
     "pas": 82,
     "dri": 73,
     "def": 77,
     "phy": 68
    }
   },
   {
    "id": "arokodare_t",
    "name": "Tolu Arokodare",
    "nat": "Nigeria",
    "pos": "ST",
    "ovr": 75,
    "stats": {
     "pac": 76,
     "sho": 74,
     "pas": 56,
     "dri": 65,
     "def": 31,
     "phy": 82
    }
   },
   {
    "id": "carrizo_m",
    "name": "Maher Carrizo",
    "nat": "Argentina",
    "pos": "RW",
    "ovr": 74,
    "stats": {
     "pac": 86,
     "sho": 69,
     "pas": 66,
     "dri": 78,
     "def": 42,
     "phy": 71
    }
   },
   {
    "id": "regeer_y",
    "name": "Youri Regeer",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 73,
    "stats": {
     "pac": 69,
     "sho": 57,
     "pas": 71,
     "dri": 72,
     "def": 71,
     "phy": 69
    }
   },
   {
    "id": "edvardsen_o",
    "name": "Oliver Edvardsen",
    "nat": "Norway",
    "pos": "LW",
    "ovr": 72,
    "stats": {
     "pac": 80,
     "sho": 67,
     "pas": 64,
     "dri": 74,
     "def": 56,
     "phy": 72
    }
   },
   {
    "id": "rosa_l",
    "name": "Lucas Rosa",
    "nat": "Brazil",
    "pos": "RB",
    "ovr": 72,
    "stats": {
     "pac": 78,
     "sho": 42,
     "pas": 62,
     "dri": 67,
     "def": 69,
     "phy": 70
    }
   },
   {
    "id": "gaaei_a",
    "name": "Anton Gaaei",
    "nat": "Denmark",
    "pos": "RB",
    "ovr": 71,
    "stats": {
     "pac": 86,
     "sho": 66,
     "pas": 63,
     "dri": 65,
     "def": 62,
     "phy": 73
    }
   },
   {
    "id": "wijndal_o",
    "name": "Owen Wijndal",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 71,
    "stats": {
     "pac": 78,
     "sho": 54,
     "pas": 69,
     "dri": 69,
     "def": 65,
     "phy": 71
    }
   },
   {
    "id": "mokio_j",
    "name": "Jorthy Mokio",
    "nat": "DR Congo",
    "pos": "CDM",
    "ovr": 71,
    "stats": {
     "pac": 67,
     "sho": 50,
     "pas": 64,
     "dri": 72,
     "def": 69,
     "phy": 70
    }
   },
   {
    "id": "paes_m",
    "name": "Maarten Paes",
    "nat": "Indonesia",
    "pos": "GK",
    "ovr": 71,
    "stats": {
     "div": 72,
     "han": 68,
     "kic": 66,
     "ref": 72,
     "spd": 31,
     "pos": 72
    }
   },
   {
    "id": "janse_d",
    "name": "Dies Janse",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 70,
    "stats": {
     "pac": 63,
     "sho": 36,
     "pas": 61,
     "dri": 63,
     "def": 68,
     "phy": 79
    }
   },
   {
    "id": "bounida_r",
    "name": "Rayane Bounida",
    "nat": "Morocco",
    "pos": "RW",
    "ovr": 69,
    "stats": {
     "pac": 66,
     "sho": 62,
     "pas": 72,
     "dri": 74,
     "def": 33,
     "phy": 55
    }
   },
   {
    "id": "bouwman_a",
    "name": "Aaron Bouwman",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 68,
    "stats": {
     "pac": 57,
     "sho": 51,
     "pas": 56,
     "dri": 61,
     "def": 68,
     "phy": 70
    }
   },
   {
    "id": "ouazane_a",
    "name": "Abdellah Ouazane",
    "nat": "Morocco",
    "pos": "CAM",
    "ovr": 66,
    "stats": {
     "pac": 76,
     "sho": 61,
     "pas": 64,
     "dri": 71,
     "def": 42,
     "phy": 63
    }
   },
   {
    "id": "heerkens_j",
    "name": "Joeri Heerkens",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 66,
    "stats": {
     "div": 67,
     "han": 63,
     "kic": 67,
     "ref": 69,
     "spd": 22,
     "pos": 68
    }
   },
   {
    "id": "dongen_a",
    "name": "Amourricho van Axel Dongen",
    "nat": "Netherlands",
    "pos": "LW",
    "ovr": 66,
    "stats": {
     "pac": 79,
     "sho": 59,
     "pas": 59,
     "dri": 70,
     "def": 29,
     "phy": 55
    }
   },
   {
    "id": "gooijer_t",
    "name": "Tristan Gooijer",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 65,
    "stats": {
     "pac": 71,
     "sho": 38,
     "pas": 52,
     "dri": 64,
     "def": 62,
     "phy": 72
    }
   },
   {
    "id": "reverson_p",
    "name": "Paul Reverson",
    "nat": "Ghana",
    "pos": "GK",
    "ovr": 65,
    "stats": {
     "div": 66,
     "han": 62,
     "kic": 65,
     "ref": 70,
     "spd": 30,
     "pos": 64
    }
   },
   {
    "id": "torrents_j",
    "name": "Jofre Torrents",
    "nat": "Spain",
    "pos": "LB",
    "ovr": 64,
    "stats": {
     "pac": 66,
     "sho": 32,
     "pas": 59,
     "dri": 64,
     "def": 60,
     "phy": 63
    }
   },
   {
    "id": "nash_p",
    "name": "Pharell Nash",
    "nat": "Netherlands",
    "pos": "LW",
    "ovr": 63,
    "stats": {
     "pac": 86,
     "sho": 57,
     "pas": 56,
     "dri": 65,
     "def": 26,
     "phy": 55
    }
   },
   {
    "id": "faberski_j",
    "name": "Jan Faberski",
    "nat": "Poland",
    "pos": "RW",
    "ovr": 63,
    "stats": {
     "pac": 81,
     "sho": 52,
     "pas": 53,
     "dri": 71,
     "def": 26,
     "phy": 39
    }
   },
   {
    "id": "johnson_j2",
    "name": "Jinairo Johnson",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 62,
    "stats": {
     "pac": 76,
     "sho": 44,
     "pas": 55,
     "dri": 60,
     "def": 60,
     "phy": 69
    }
   },
   {
    "id": "pugno_d",
    "name": "Diego Pugno",
    "nat": "Italy",
    "pos": "ST",
    "ovr": 61,
    "stats": {
     "pac": 58,
     "sho": 61,
     "pas": 52,
     "dri": 61,
     "def": 22,
     "phy": 54
    }
   }
  ]
 },
 {
  "id": "psv",
  "squad": [
   {
    "id": "perisic_i",
    "name": "Ivan Perišić",
    "nat": "Croatia",
    "pos": "LW",
    "ovr": 81,
    "stats": {
     "pac": 74,
     "sho": 80,
     "pas": 81,
     "dri": 79,
     "def": 68,
     "phy": 77
    }
   },
   {
    "id": "junior_m",
    "name": "Mauro Júnior",
    "nat": "Brazil",
    "pos": "LB",
    "ovr": 81,
    "stats": {
     "pac": 83,
     "sho": 66,
     "pas": 70,
     "dri": 82,
     "def": 76,
     "phy": 60
    }
   },
   {
    "id": "schouten_j",
    "name": "Jerdy Schouten",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 80,
    "stats": {
     "pac": 57,
     "sho": 59,
     "pas": 74,
     "dri": 78,
     "def": 81,
     "phy": 74
    }
   },
   {
    "id": "dest_s",
    "name": "Sergiño Dest",
    "nat": "USA",
    "pos": "RB",
    "ovr": 79,
    "stats": {
     "pac": 87,
     "sho": 60,
     "pas": 75,
     "dri": 83,
     "def": 72,
     "phy": 73
    }
   },
   {
    "id": "til_g",
    "name": "Guus Til",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 78,
    "stats": {
     "pac": 79,
     "sho": 77,
     "pas": 74,
     "dri": 74,
     "def": 65,
     "phy": 76
    }
   },
   {
    "id": "geertruida_l",
    "name": "Lutsharel Geertruida",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 78,
    "stats": {
     "pac": 70,
     "sho": 62,
     "pas": 70,
     "dri": 73,
     "def": 78,
     "phy": 77
    }
   },
   {
    "id": "pepi_r",
    "name": "Ricardo Pepi",
    "nat": "USA",
    "pos": "ST",
    "ovr": 78,
    "stats": {
     "pac": 71,
     "sho": 80,
     "pas": 61,
     "dri": 73,
     "def": 46,
     "phy": 73
    }
   },
   {
    "id": "kostic_f",
    "name": "Filip Kostić",
    "nat": "Serbia",
    "pos": "LB",
    "ovr": 77,
    "stats": {
     "pac": 80,
     "sho": 71,
     "pas": 80,
     "dri": 76,
     "def": 71,
     "phy": 70
    }
   },
   {
    "id": "man_d",
    "name": "Dennis Man",
    "nat": "Romania",
    "pos": "RW",
    "ovr": 77,
    "stats": {
     "pac": 88,
     "sho": 74,
     "pas": 71,
     "dri": 78,
     "def": 43,
     "phy": 72
    }
   },
   {
    "id": "sano_k2",
    "name": "Kodai Sano",
    "nat": "Japan",
    "pos": "CM",
    "ovr": 77,
    "stats": {
     "pac": 67,
     "sho": 62,
     "pas": 73,
     "dri": 81,
     "def": 70,
     "phy": 68
    }
   },
   {
    "id": "plea_a",
    "name": "Alassane Pléa",
    "nat": "France",
    "pos": "ST",
    "ovr": 77,
    "stats": {
     "pac": 73,
     "sho": 78,
     "pas": 80,
     "dri": 79,
     "def": 38,
     "phy": 69
    }
   },
   {
    "id": "mijnans_s",
    "name": "Sven Mijnans",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 77,
    "stats": {
     "pac": 52,
     "sho": 71,
     "pas": 77,
     "dri": 77,
     "def": 65,
     "phy": 73
    }
   },
   {
    "id": "kovar_m",
    "name": "Matěj Kovář",
    "nat": "Czechia",
    "pos": "GK",
    "ovr": 77,
    "stats": {
     "div": 76,
     "han": 76,
     "kic": 78,
     "ref": 77,
     "spd": 30,
     "pos": 77
    }
   },
   {
    "id": "yarek",
    "name": "Yarek",
    "nat": "Spain",
    "pos": "CB",
    "ovr": 77,
    "stats": {
     "pac": 70,
     "sho": 52,
     "pas": 65,
     "dri": 68,
     "def": 77,
     "phy": 76
    }
   },
   {
    "id": "wanner_p",
    "name": "Paul Wanner",
    "nat": "Austria",
    "pos": "CAM",
    "ovr": 76,
    "stats": {
     "pac": 72,
     "sho": 66,
     "pas": 74,
     "dri": 77,
     "def": 57,
     "phy": 66
    }
   },
   {
    "id": "flamingo_r",
    "name": "Ryan Flamingo",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 76,
    "stats": {
     "pac": 61,
     "sho": 63,
     "pas": 66,
     "dri": 67,
     "def": 75,
     "phy": 78
    }
   },
   {
    "id": "olij_n",
    "name": "Nick Olij",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 75,
    "stats": {
     "div": 78,
     "han": 74,
     "kic": 60,
     "ref": 78,
     "spd": 30,
     "pos": 73
    }
   },
   {
    "id": "bajraktarevic_e",
    "name": "Esmir Bajraktarević",
    "nat": "Bosnia and Herzegovina",
    "pos": "RW",
    "ovr": 74,
    "stats": {
     "pac": 78,
     "sho": 66,
     "pas": 69,
     "dri": 79,
     "def": 44,
     "phy": 61
    }
   },
   {
    "id": "bommel_r",
    "name": "Ruben van Bommel",
    "nat": "Netherlands",
    "pos": "LW",
    "ovr": 74,
    "stats": {
     "pac": 86,
     "sho": 70,
     "pas": 65,
     "dri": 76,
     "def": 25,
     "phy": 68
    }
   },
   {
    "id": "obispo_a",
    "name": "Armando Obispo",
    "nat": "Curaçao",
    "pos": "CB",
    "ovr": 74,
    "stats": {
     "pac": 65,
     "sho": 43,
     "pas": 60,
     "dri": 66,
     "def": 73,
     "phy": 73
    }
   },
   {
    "id": "driouech_c",
    "name": "Couhaib Driouech",
    "nat": "Morocco",
    "pos": "LW",
    "ovr": 72,
    "stats": {
     "pac": 92,
     "sho": 63,
     "pas": 61,
     "dri": 73,
     "def": 26,
     "phy": 63
    }
   },
   {
    "id": "sildillia_k",
    "name": "Kiliann Sildillia",
    "nat": "France",
    "pos": "RB",
    "ovr": 72,
    "stats": {
     "pac": 64,
     "sho": 30,
     "pas": 61,
     "dri": 67,
     "def": 73,
     "phy": 73
    }
   },
   {
    "id": "nagalo_a",
    "name": "Adamo Nagalo",
    "nat": "Burkina Faso",
    "pos": "CB",
    "ovr": 69,
    "stats": {
     "pac": 70,
     "sho": 29,
     "pas": 33,
     "dri": 61,
     "def": 68,
     "phy": 78
    }
   },
   {
    "id": "fernandez_n",
    "name": "Noah Fernandez",
    "nat": "Belgium",
    "pos": "CAM",
    "ovr": 67,
    "stats": {
     "pac": 71,
     "sho": 57,
     "pas": 67,
     "dri": 71,
     "def": 53,
     "phy": 61
    }
   },
   {
    "id": "babadi_i",
    "name": "Isaac Babadi",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 67,
    "stats": {
     "pac": 71,
     "sho": 53,
     "pas": 60,
     "dri": 73,
     "def": 43,
     "phy": 59
    }
   },
   {
    "id": "berg_j",
    "name": "Joël van den Berg",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 65,
    "stats": {
     "pac": 67,
     "sho": 60,
     "pas": 65,
     "dri": 67,
     "def": 60,
     "phy": 70
    }
   },
   {
    "id": "bouhamdi_a",
    "name": "Amir Bouhamdi",
    "nat": "Morocco",
    "pos": "LW",
    "ovr": 64,
    "stats": {
     "pac": 75,
     "sho": 55,
     "pas": 59,
     "dri": 72,
     "def": 33,
     "phy": 43
    }
   },
   {
    "id": "merien_f",
    "name": "Fabian Merién",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 63,
    "stats": {
     "pac": 76,
     "sho": 35,
     "pas": 54,
     "dri": 60,
     "def": 62,
     "phy": 63
    }
   },
   {
    "id": "smolenaars_t",
    "name": "Tijn Smolenaars",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 62,
    "stats": {
     "div": 62,
     "han": 61,
     "kic": 60,
     "ref": 62,
     "spd": 32,
     "pos": 62
    }
   },
   {
    "id": "cornelion_s",
    "name": "Shurjano Cornelion",
    "nat": "Curaçao",
    "pos": "CAM",
    "ovr": 61,
    "stats": {
     "pac": 69,
     "sho": 56,
     "pas": 61,
     "dri": 61,
     "def": 44,
     "phy": 59
    }
   }
  ]
 },
 {
  "id": "feyenoord",
  "squad": [
   {
    "id": "ueda_a2",
    "name": "Ayase Ueda",
    "nat": "Japan",
    "pos": "ST",
    "ovr": 78,
    "stats": {
     "pac": 74,
     "sho": 78,
     "pas": 62,
     "dri": 73,
     "def": 30,
     "phy": 73
    }
   },
   {
    "id": "watanabe_t",
    "name": "Tsuyoshi Watanabe",
    "nat": "Japan",
    "pos": "CB",
    "ovr": 78,
    "stats": {
     "pac": 74,
     "sho": 39,
     "pas": 53,
     "dri": 61,
     "def": 79,
     "phy": 78
    }
   },
   {
    "id": "valente_l",
    "name": "Luciano Valente",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 77,
    "stats": {
     "pac": 71,
     "sho": 67,
     "pas": 78,
     "dri": 79,
     "def": 62,
     "phy": 73
    }
   },
   {
    "id": "steijn_s",
    "name": "Sem Steijn",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 77,
    "stats": {
     "pac": 67,
     "sho": 82,
     "pas": 74,
     "dri": 76,
     "def": 43,
     "phy": 70
    }
   },
   {
    "id": "moussa_a2",
    "name": "Anis Hadj Moussa",
    "nat": "Algeria",
    "pos": "RW",
    "ovr": 77,
    "stats": {
     "pac": 79,
     "sho": 74,
     "pas": 69,
     "dri": 84,
     "def": 31,
     "phy": 61
    }
   },
   {
    "id": "bos_j",
    "name": "Jordan Bos",
    "nat": "Australia",
    "pos": "LB",
    "ovr": 76,
    "stats": {
     "pac": 90,
     "sho": 63,
     "pas": 68,
     "dri": 75,
     "def": 69,
     "phy": 80
    }
   },
   {
    "id": "read_g",
    "name": "Givairo Read",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 76,
    "stats": {
     "pac": 79,
     "sho": 56,
     "pas": 70,
     "dri": 73,
     "def": 71,
     "phy": 73
    }
   },
   {
    "id": "targhalline_o",
    "name": "Oussama Targhalline",
    "nat": "Morocco",
    "pos": "CDM",
    "ovr": 76,
    "stats": {
     "pac": 64,
     "sho": 64,
     "pas": 72,
     "dri": 76,
     "def": 74,
     "phy": 68
    }
   },
   {
    "id": "marmol_m",
    "name": "Mika Mármol",
    "nat": "Spain",
    "pos": "CB",
    "ovr": 75,
    "stats": {
     "pac": 85,
     "sho": 55,
     "pas": 66,
     "dri": 73,
     "def": 74,
     "phy": 79
    }
   },
   {
    "id": "vanhoutte_c",
    "name": "Charles Vanhoutte",
    "nat": "Belgium",
    "pos": "CDM",
    "ovr": 75,
    "stats": {
     "pac": 52,
     "sho": 65,
     "pas": 73,
     "dri": 71,
     "def": 72,
     "phy": 78
    }
   },
   {
    "id": "juste_j",
    "name": "Jeremiah St. Juste",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 74,
    "stats": {
     "pac": 89,
     "sho": 57,
     "pas": 65,
     "dri": 71,
     "def": 74,
     "phy": 74
    }
   },
   {
    "id": "zechiel_g",
    "name": "Gjivai Zechiël",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 74,
    "stats": {
     "pac": 75,
     "sho": 67,
     "pas": 68,
     "dri": 75,
     "def": 69,
     "phy": 71
    }
   },
   {
    "id": "moder_j",
    "name": "Jakub Moder",
    "nat": "Poland",
    "pos": "CM",
    "ovr": 74,
    "stats": {
     "pac": 55,
     "sho": 70,
     "pas": 74,
     "dri": 72,
     "def": 67,
     "phy": 77
    }
   },
   {
    "id": "smal_g",
    "name": "Gijs Smal",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 73,
    "stats": {
     "pac": 68,
     "sho": 61,
     "pas": 75,
     "dri": 70,
     "def": 69,
     "phy": 70
    }
   },
   {
    "id": "beelen_t",
    "name": "Thomas Beelen",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 73,
    "stats": {
     "pac": 77,
     "sho": 43,
     "pas": 63,
     "dri": 68,
     "def": 72,
     "phy": 78
    }
   },
   {
    "id": "lotomba_j",
    "name": "Jordan Lotomba",
    "nat": "Switzerland",
    "pos": "RB",
    "ovr": 73,
    "stats": {
     "pac": 71,
     "sho": 48,
     "pas": 65,
     "dri": 71,
     "def": 72,
     "phy": 69
    }
   },
   {
    "id": "lopez_j",
    "name": "Javi López",
    "nat": "Spain",
    "pos": "LB",
    "ovr": 73,
    "stats": {
     "pac": 73,
     "sho": 45,
     "pas": 67,
     "dri": 70,
     "def": 70,
     "phy": 69
    }
   },
   {
    "id": "nieuwkoop_b",
    "name": "Bart Nieuwkoop",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 72,
    "stats": {
     "pac": 70,
     "sho": 62,
     "pas": 71,
     "dri": 70,
     "def": 70,
     "phy": 73
    }
   },
   {
    "id": "deijl_m",
    "name": "Mats Deijl",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 72,
    "stats": {
     "pac": 68,
     "sho": 58,
     "pas": 62,
     "dri": 66,
     "def": 70,
     "phy": 76
    }
   },
   {
    "id": "ernst_t",
    "name": "Tjark Ernst",
    "nat": "Germany",
    "pos": "GK",
    "ovr": 72,
    "stats": {
     "div": 77,
     "han": 73,
     "kic": 62,
     "ref": 76,
     "spd": 31,
     "pos": 69
    }
   },
   {
    "id": "tengstedt_c",
    "name": "Casper Tengstedt",
    "nat": "Denmark",
    "pos": "ST",
    "ovr": 72,
    "stats": {
     "pac": 72,
     "sho": 72,
     "pas": 63,
     "dri": 69,
     "def": 36,
     "phy": 61
    }
   },
   {
    "id": "ivanusec_l",
    "name": "Luka Ivanušec",
    "nat": "Croatia",
    "pos": "CAM",
    "ovr": 71,
    "stats": {
     "pac": 58,
     "sho": 69,
     "pas": 70,
     "dri": 77,
     "def": 57,
     "phy": 71
    }
   },
   {
    "id": "ferri_n",
    "name": "Nacho Ferri",
    "nat": "Spain",
    "pos": "ST",
    "ovr": 70,
    "stats": {
     "pac": 68,
     "sho": 70,
     "pas": 54,
     "dri": 68,
     "def": 29,
     "phy": 78
    }
   },
   {
    "id": "kasanwirjo_n",
    "name": "Neraysho Kasanwirjo",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 68,
    "stats": {
     "pac": 73,
     "sho": 42,
     "pas": 54,
     "dri": 58,
     "def": 69,
     "phy": 74
    }
   },
   {
    "id": "kraaijeveld_t",
    "name": "Thijs Kraaijeveld",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 67,
    "stats": {
     "pac": 59,
     "sho": 52,
     "pas": 61,
     "dri": 63,
     "def": 69,
     "phy": 59
    }
   },
   {
    "id": "elshout_t",
    "name": "Tobias van den Elshout",
    "nat": "Netherlands",
    "pos": "LW",
    "ovr": 66,
    "stats": {
     "pac": 67,
     "sho": 60,
     "pas": 64,
     "dri": 69,
     "def": 47,
     "phy": 64
    }
   },
   {
    "id": "carrillo_s",
    "name": "Stéphano Carrillo",
    "nat": "Mexico",
    "pos": "ST",
    "ovr": 66,
    "stats": {
     "pac": 68,
     "sho": 64,
     "pas": 59,
     "dri": 62,
     "def": 35,
     "phy": 76
    }
   },
   {
    "id": "bossin_l",
    "name": "Liam Bossin",
    "nat": "Ireland",
    "pos": "GK",
    "ovr": 65,
    "stats": {
     "div": 66,
     "han": 63,
     "kic": 61,
     "ref": 65,
     "spd": 46,
     "pos": 62
    }
   },
   {
    "id": "persie_s",
    "name": "Shaqueel van Persie",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 65,
    "stats": {
     "pac": 69,
     "sho": 65,
     "pas": 53,
     "dri": 68,
     "def": 23,
     "phy": 56
    }
   },
   {
    "id": "zinhagel_j",
    "name": "Jivayno Zinhagel",
    "nat": "Netherlands",
    "pos": "LW",
    "ovr": 59,
    "stats": {
     "pac": 88,
     "sho": 34,
     "pas": 52,
     "dri": 59,
     "def": 30,
     "phy": 44
    }
   },
   {
    "id": "berger_m",
    "name": "Mannou Berger",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 59,
    "stats": {
     "div": 60,
     "han": 57,
     "kic": 53,
     "ref": 64,
     "spd": 22,
     "pos": 57
    }
   },
   {
    "id": "wessels_t",
    "name": "Tijme Wessels",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 58,
    "stats": {
     "pac": 69,
     "sho": 34,
     "pas": 42,
     "dri": 51,
     "def": 60,
     "phy": 57
    }
   }
  ]
 },
 {
  "id": "az_alkmaar",
  "squad": [
   {
    "id": "clasie_j",
    "name": "Jordy Clasie",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 77,
    "stats": {
     "pac": 43,
     "sho": 63,
     "pas": 79,
     "dri": 73,
     "def": 70,
     "phy": 67
    }
   },
   {
    "id": "goes_w",
    "name": "Wouter Goes",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 77,
    "stats": {
     "pac": 60,
     "sho": 31,
     "pas": 58,
     "dri": 67,
     "def": 77,
     "phy": 81
    }
   },
   {
    "id": "stengs_c",
    "name": "Calvin Stengs",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 76,
    "stats": {
     "pac": 64,
     "sho": 68,
     "pas": 77,
     "dri": 77,
     "def": 50,
     "phy": 67
    }
   },
   {
    "id": "smit_k",
    "name": "Kees Smit",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 75,
    "stats": {
     "pac": 59,
     "sho": 63,
     "pas": 74,
     "dri": 79,
     "def": 65,
     "phy": 69
    }
   },
   {
    "id": "koopmeiners_p",
    "name": "Peer Koopmeiners",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 74,
    "stats": {
     "pac": 60,
     "sho": 54,
     "pas": 73,
     "dri": 65,
     "def": 72,
     "phy": 73
    }
   },
   {
    "id": "meerdink_m",
    "name": "Mexx Meerdink",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 74,
    "stats": {
     "pac": 69,
     "sho": 72,
     "pas": 58,
     "dri": 73,
     "def": 32,
     "phy": 78
    }
   },
   {
    "id": "kasius_d",
    "name": "Denso Kasius",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 73,
    "stats": {
     "pac": 90,
     "sho": 58,
     "pas": 68,
     "dri": 71,
     "def": 65,
     "phy": 73
    }
   },
   {
    "id": "busser_j",
    "name": "Jari De Busser",
    "nat": "Belgium",
    "pos": "GK",
    "ovr": 73,
    "stats": {
     "div": 75,
     "han": 70,
     "kic": 65,
     "ref": 76,
     "spd": 24,
     "pos": 71
    }
   },
   {
    "id": "maikuma_s",
    "name": "Seiya Maikuma",
    "nat": "Japan",
    "pos": "RB",
    "ovr": 72,
    "stats": {
     "pac": 72,
     "sho": 61,
     "pas": 67,
     "dri": 71,
     "def": 68,
     "phy": 72
    }
   },
   {
    "id": "resink_s",
    "name": "Stije Resink",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 72,
    "stats": {
     "pac": 66,
     "sho": 59,
     "pas": 68,
     "dri": 69,
     "def": 67,
     "phy": 73
    }
   },
   {
    "id": "jensen_i",
    "name": "Isak Jensen",
    "nat": "Denmark",
    "pos": "LW",
    "ovr": 72,
    "stats": {
     "pac": 77,
     "sho": 67,
     "pas": 67,
     "dri": 73,
     "def": 33,
     "phy": 73
    }
   },
   {
    "id": "pataty",
    "name": "Pataty",
    "nat": "Brazil",
    "pos": "RW",
    "ovr": 72,
    "stats": {
     "pac": 87,
     "sho": 68,
     "pas": 64,
     "dri": 73,
     "def": 31,
     "phy": 64
    }
   },
   {
    "id": "sin_m",
    "name": "Matěj Šín",
    "nat": "Czechia",
    "pos": "CAM",
    "ovr": 72,
    "stats": {
     "pac": 61,
     "sho": 64,
     "pas": 71,
     "dri": 73,
     "def": 50,
     "phy": 64
    }
   },
   {
    "id": "daal_r",
    "name": "Ro-Zangelo Daal",
    "nat": "Netherlands",
    "pos": "LW",
    "ovr": 72,
    "stats": {
     "pac": 78,
     "sho": 62,
     "pas": 66,
     "dri": 77,
     "def": 36,
     "phy": 57
    }
   },
   {
    "id": "sadiq_i",
    "name": "Ibrahim Sadiq",
    "nat": "Ghana",
    "pos": "RW",
    "ovr": 71,
    "stats": {
     "pac": 83,
     "sho": 65,
     "pas": 59,
     "dri": 74,
     "def": 34,
     "phy": 59
    }
   },
   {
    "id": "wit_m",
    "name": "Mees de Wit",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 70,
    "stats": {
     "pac": 75,
     "sho": 54,
     "pas": 69,
     "dri": 71,
     "def": 63,
     "phy": 73
    }
   },
   {
    "id": "dijkstra_e",
    "name": "Elijah Dijkstra",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 70,
    "stats": {
     "pac": 83,
     "sho": 53,
     "pas": 64,
     "dri": 70,
     "def": 61,
     "phy": 66
    }
   },
   {
    "id": "chavez_m",
    "name": "Mateo Chávez",
    "nat": "Mexico",
    "pos": "LB",
    "ovr": 70,
    "stats": {
     "pac": 77,
     "sho": 43,
     "pas": 63,
     "dri": 70,
     "def": 65,
     "phy": 65
    }
   },
   {
    "id": "owusu_oduro_r",
    "name": "Rome-Jayden Owusu-Oduro",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 70,
    "stats": {
     "div": 68,
     "han": 65,
     "kic": 66,
     "ref": 73,
     "spd": 40,
     "pos": 69
    }
   },
   {
    "id": "hornkamp_j",
    "name": "Jizz Hornkamp",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 69,
    "stats": {
     "pac": 63,
     "sho": 74,
     "pas": 56,
     "dri": 64,
     "def": 55,
     "phy": 69
    }
   },
   {
    "id": "zoet_j",
    "name": "Jeroen Zoet",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 68,
    "stats": {
     "div": 66,
     "han": 70,
     "kic": 69,
     "ref": 66,
     "spd": 51,
     "pos": 69
    }
   },
   {
    "id": "kwakman_d",
    "name": "Dave Kwakman",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 68,
    "stats": {
     "pac": 67,
     "sho": 57,
     "pas": 66,
     "dri": 69,
     "def": 61,
     "phy": 66
    }
   },
   {
    "id": "ichihara_r",
    "name": "Rion Ichihara",
    "nat": "Japan",
    "pos": "CB",
    "ovr": 67,
    "stats": {
     "pac": 76,
     "sho": 35,
     "pas": 64,
     "dri": 59,
     "def": 66,
     "phy": 68
    }
   },
   {
    "id": "lahdo_m",
    "name": "Mayckel Lahdo",
    "nat": "Sweden",
    "pos": "RW",
    "ovr": 67,
    "stats": {
     "pac": 79,
     "sho": 63,
     "pas": 59,
     "dri": 71,
     "def": 27,
     "phy": 57
    }
   },
   {
    "id": "duijl_b",
    "name": "Billy van Duijl",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 67,
    "stats": {
     "pac": 54,
     "sho": 34,
     "pas": 53,
     "dri": 53,
     "def": 68,
     "phy": 71
    }
   },
   {
    "id": "dekker_m",
    "name": "Maxim Dekker",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 67,
    "stats": {
     "pac": 49,
     "sho": 36,
     "pas": 55,
     "dri": 51,
     "def": 67,
     "phy": 65
    }
   },
   {
    "id": "oufkir_a",
    "name": "Ayoub Oufkir",
    "nat": "Netherlands",
    "pos": "RW",
    "ovr": 66,
    "stats": {
     "pac": 82,
     "sho": 60,
     "pas": 63,
     "dri": 68,
     "def": 38,
     "phy": 47
    }
   },
   {
    "id": "verhulst_h",
    "name": "Hobie Verhulst",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 65,
    "stats": {
     "div": 64,
     "han": 63,
     "kic": 70,
     "ref": 65,
     "spd": 43,
     "pos": 65
    }
   },
   {
    "id": "grand_s",
    "name": "Sam de Grand",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 65,
    "stats": {
     "pac": 74,
     "sho": 42,
     "pas": 61,
     "dri": 64,
     "def": 59,
     "phy": 63
    }
   },
   {
    "id": "duijn_s",
    "name": "Sem van Duijn",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 65,
    "stats": {
     "pac": 72,
     "sho": 62,
     "pas": 59,
     "dri": 67,
     "def": 30,
     "phy": 66
    }
   },
   {
    "id": "schouten_l",
    "name": "Lewis Schouten",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 65,
    "stats": {
     "pac": 55,
     "sho": 47,
     "pas": 59,
     "dri": 60,
     "def": 63,
     "phy": 70
    }
   },
   {
    "id": "kovacs_b",
    "name": "Bendegúz Kovács",
    "nat": "Hungary",
    "pos": "ST",
    "ovr": 64,
    "stats": {
     "pac": 64,
     "sho": 64,
     "pas": 46,
     "dri": 58,
     "def": 29,
     "phy": 69
    }
   },
   {
    "id": "bouziane_w",
    "name": "Wassim Bouziane",
    "nat": "Netherlands",
    "pos": "LW",
    "ovr": 63,
    "stats": {
     "pac": 76,
     "sho": 55,
     "pas": 58,
     "dri": 69,
     "def": 33,
     "phy": 56
    }
   },
   {
    "id": "bergraaf_j",
    "name": "Jerolldino Bergraaf",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 63,
    "stats": {
     "pac": 73,
     "sho": 60,
     "pas": 40,
     "dri": 59,
     "def": 27,
     "phy": 69
    }
   },
   {
    "id": "oerip_j",
    "name": "Julian Oerip",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 62,
    "stats": {
     "pac": 64,
     "sho": 48,
     "pas": 63,
     "dri": 62,
     "def": 43,
     "phy": 57
    }
   },
   {
    "id": "wit_h",
    "name": "Hessel de Wit",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 60,
    "stats": {
     "pac": 66,
     "sho": 48,
     "pas": 62,
     "dri": 63,
     "def": 52,
     "phy": 53
    }
   },
   {
    "id": "natali_a",
    "name": "Andrea Natali",
    "nat": "Italy",
    "pos": "CB",
    "ovr": 60,
    "stats": {
     "pac": 56,
     "sho": 33,
     "pas": 53,
     "dri": 54,
     "def": 60,
     "phy": 60
    }
   }
  ]
 },
 {
  "id": "twente",
  "name": "FC Twente",
  "logo": "🔴⚪",
  "squad": [
   {
    "id": "weghorst_w",
    "name": "Wout Weghorst",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 77,
    "stats": {
     "pac": 34,
     "sho": 78,
     "pas": 61,
     "dri": 62,
     "def": 57,
     "phy": 85
    }
   },
   {
    "id": "rooij_b",
    "name": "Bart van Rooij",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 76,
    "stats": {
     "pac": 87,
     "sho": 51,
     "pas": 68,
     "dri": 71,
     "def": 69,
     "phy": 77
    }
   },
   {
    "id": "unnerstall_l",
    "name": "Lars Unnerstall",
    "nat": "Germany",
    "pos": "GK",
    "ovr": 76,
    "stats": {
     "div": 76,
     "han": 73,
     "kic": 63,
     "ref": 79,
     "spd": 32,
     "pos": 76
    }
   },
   {
    "id": "drommel_j",
    "name": "Joël Drommel",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 74,
    "stats": {
     "div": 74,
     "han": 72,
     "kic": 75,
     "ref": 76,
     "spd": 51,
     "pos": 74
    }
   },
   {
    "id": "zerrouki_r",
    "name": "Ramiz Zerrouki",
    "nat": "Algeria",
    "pos": "CDM",
    "ovr": 74,
    "stats": {
     "pac": 56,
     "sho": 66,
     "pas": 71,
     "dri": 73,
     "def": 68,
     "phy": 79
    }
   },
   {
    "id": "rots_d",
    "name": "Daan Rots",
    "nat": "Netherlands",
    "pos": "RW",
    "ovr": 73,
    "stats": {
     "pac": 78,
     "sho": 69,
     "pas": 69,
     "dri": 73,
     "def": 40,
     "phy": 64
    }
   },
   {
    "id": "lammers_s",
    "name": "Sam Lammers",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 72,
    "stats": {
     "pac": 63,
     "sho": 70,
     "pas": 67,
     "dri": 76,
     "def": 36,
     "phy": 68
    }
   },
   {
    "id": "rjaster_s",
    "name": "Sondre Ørjasæter",
    "nat": "Norway",
    "pos": "LW",
    "ovr": 72,
    "stats": {
     "pac": 79,
     "sho": 62,
     "pas": 66,
     "dri": 77,
     "def": 31,
     "phy": 62
    }
   },
   {
    "id": "propper_r",
    "name": "Robin Pröpper",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 72,
    "stats": {
     "pac": 47,
     "sho": 31,
     "pas": 60,
     "dri": 55,
     "def": 74,
     "phy": 74
    }
   },
   {
    "id": "pasveer_r",
    "name": "Remko Pasveer",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 71,
    "stats": {
     "div": 66,
     "han": 76,
     "kic": 78,
     "ref": 62,
     "spd": 33,
     "pos": 78
    }
   },
   {
    "id": "belt_t",
    "name": "Thomas van den Belt",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 71,
    "stats": {
     "pac": 56,
     "sho": 67,
     "pas": 69,
     "dri": 68,
     "def": 65,
     "phy": 68
    }
   },
   {
    "id": "hilgers_m",
    "name": "Mees Hilgers",
    "nat": "Indonesia",
    "pos": "CB",
    "ovr": 71,
    "stats": {
     "pac": 72,
     "sho": 43,
     "pas": 54,
     "dri": 60,
     "def": 71,
     "phy": 73
    }
   },
   {
    "id": "nijstad_r",
    "name": "Ruud Nijstad",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 70,
    "stats": {
     "pac": 67,
     "sho": 49,
     "pas": 57,
     "dri": 67,
     "def": 70,
     "phy": 72
    }
   },
   {
    "id": "pjaca_m",
    "name": "Marko Pjaca",
    "nat": "Croatia",
    "pos": "LW",
    "ovr": 70,
    "stats": {
     "pac": 64,
     "sho": 69,
     "pas": 67,
     "dri": 74,
     "def": 39,
     "phy": 61
    }
   },
   {
    "id": "kjl_m",
    "name": "Mathias Kjølø",
    "nat": "Norway",
    "pos": "CDM",
    "ovr": 70,
    "stats": {
     "pac": 46,
     "sho": 56,
     "pas": 68,
     "dri": 68,
     "def": 65,
     "phy": 62
    }
   },
   {
    "id": "lemkin_s",
    "name": "Stav Lemkin",
    "nat": "Israel",
    "pos": "CB",
    "ovr": 70,
    "stats": {
     "pac": 69,
     "sho": 37,
     "pas": 53,
     "dri": 50,
     "def": 69,
     "phy": 77
    }
   },
   {
    "id": "hlynsson_k",
    "name": "Kristian Hlynsson",
    "nat": "Iceland",
    "pos": "CAM",
    "ovr": 69,
    "stats": {
     "pac": 62,
     "sho": 63,
     "pas": 64,
     "dri": 72,
     "def": 41,
     "phy": 61
    }
   },
   {
    "id": "verschueren_a",
    "name": "Arno Verschueren",
    "nat": "Belgium",
    "pos": "CAM",
    "ovr": 68,
    "stats": {
     "pac": 68,
     "sho": 66,
     "pas": 63,
     "dri": 66,
     "def": 66,
     "phy": 66
    }
   },
   {
    "id": "taha_y",
    "name": "Younes Taha",
    "nat": "Morocco",
    "pos": "CAM",
    "ovr": 68,
    "stats": {
     "pac": 79,
     "sho": 70,
     "pas": 65,
     "dri": 71,
     "def": 37,
     "phy": 62
    }
   },
   {
    "id": "booth_t",
    "name": "Taylor Booth",
    "nat": "USA",
    "pos": "RW",
    "ovr": 68,
    "stats": {
     "pac": 73,
     "sho": 62,
     "pas": 65,
     "dri": 70,
     "def": 53,
     "phy": 54
    }
   },
   {
    "id": "bruns_m",
    "name": "Max Bruns",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 68,
    "stats": {
     "pac": 62,
     "sho": 43,
     "pas": 61,
     "dri": 62,
     "def": 68,
     "phy": 71
    }
   },
   {
    "id": "unuvar_n",
    "name": "Naci Ünüvar",
    "nat": "Turkey",
    "pos": "LM",
    "ovr": 68,
    "stats": {
     "pac": 65,
     "sho": 61,
     "pas": 69,
     "dri": 73,
     "def": 38,
     "phy": 41
    }
   },
   {
    "id": "adelgaard_a",
    "name": "Asle Adelgaard",
    "nat": "Denmark",
    "pos": "LB",
    "ovr": 67,
    "stats": {
     "pac": 72,
     "sho": 35,
     "pas": 55,
     "dri": 65,
     "def": 63,
     "phy": 65
    }
   },
   {
    "id": "weidmann_d",
    "name": "Daouda Weidmann",
    "nat": "France",
    "pos": "CM",
    "ovr": 65,
    "stats": {
     "pac": 70,
     "sho": 57,
     "pas": 63,
     "dri": 67,
     "def": 58,
     "phy": 53
    }
   },
   {
    "id": "besselink_g",
    "name": "Gijs Besselink",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 65,
    "stats": {
     "pac": 52,
     "sho": 51,
     "pas": 58,
     "dri": 61,
     "def": 62,
     "phy": 66
    }
   },
   {
    "id": "thorvaldsen_f",
    "name": "Filip Erik Thorvaldsen",
    "nat": "Norway",
    "pos": "RM",
    "ovr": 64,
    "stats": {
     "pac": 84,
     "sho": 57,
     "pas": 55,
     "dri": 67,
     "def": 30,
     "phy": 49
    }
   },
   {
    "id": "maach_i",
    "name": "Issam El Maach",
    "nat": "Morocco",
    "pos": "GK",
    "ovr": 63,
    "stats": {
     "div": 64,
     "han": 60,
     "kic": 64,
     "ref": 65,
     "spd": 41,
     "pos": 62
    }
   },
   {
    "id": "kurowski_k",
    "name": "Krzysztof Kurowski",
    "nat": "Poland",
    "pos": "LB",
    "ovr": 62,
    "stats": {
     "pac": 74,
     "sho": 51,
     "pas": 59,
     "dri": 62,
     "def": 55,
     "phy": 57
    }
   },
   {
    "id": "peixoto_g",
    "name": "Guilherme Peixoto",
    "nat": "Portugal",
    "pos": "RB",
    "ovr": 62,
    "stats": {
     "pac": 74,
     "sho": 34,
     "pas": 53,
     "dri": 62,
     "def": 58,
     "phy": 59
    }
   },
   {
    "id": "hesselink_l",
    "name": "Lucas Vennegoor of Hesselink",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 61,
    "stats": {
     "pac": 58,
     "sho": 59,
     "pas": 42,
     "dri": 58,
     "def": 24,
     "phy": 66
    }
   },
   {
    "id": "gerritsen_y",
    "name": "Yannick Gerritsen",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 57,
    "stats": {
     "div": 53,
     "han": 56,
     "kic": 59,
     "ref": 60,
     "spd": 22,
     "pos": 59
    }
   }
  ]
 },
 {
  "id": "utrecht",
  "name": "FC Utrecht",
  "logo": "🔴⚪",
  "squad": [
   {
    "id": "barkas_v",
    "name": "Vasilios Barkas",
    "nat": "Greece",
    "pos": "GK",
    "ovr": 75,
    "stats": {
     "div": 75,
     "han": 73,
     "kic": 71,
     "ref": 78,
     "spd": 42,
     "pos": 73
    }
   },
   {
    "id": "cathline_y",
    "name": "Yoann Cathline",
    "nat": "France",
    "pos": "LW",
    "ovr": 75,
    "stats": {
     "pac": 83,
     "sho": 70,
     "pas": 67,
     "dri": 78,
     "def": 43,
     "phy": 66
    }
   },
   {
    "id": "wit_d",
    "name": "Dani de Wit",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 74,
    "stats": {
     "pac": 48,
     "sho": 75,
     "pas": 69,
     "dri": 70,
     "def": 71,
     "phy": 80
    }
   },
   {
    "id": "overeem_j",
    "name": "Joris van Overeem",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 73,
    "stats": {
     "pac": 64,
     "sho": 58,
     "pas": 70,
     "dri": 73,
     "def": 69,
     "phy": 64
    }
   },
   {
    "id": "paredes_k",
    "name": "Kevin Paredes",
    "nat": "USA",
    "pos": "LM",
    "ovr": 72,
    "stats": {
     "pac": 78,
     "sho": 61,
     "pas": 63,
     "dri": 76,
     "def": 58,
     "phy": 47
    }
   },
   {
    "id": "engwanda_a",
    "name": "Alonzo Engwanda",
    "nat": "Belgium",
    "pos": "CDM",
    "ovr": 71,
    "stats": {
     "pac": 75,
     "sho": 52,
     "pas": 61,
     "dri": 69,
     "def": 69,
     "phy": 75
    }
   },
   {
    "id": "alarcon",
    "name": "Alarcón",
    "nat": "Spain",
    "pos": "RW",
    "ovr": 71,
    "stats": {
     "pac": 83,
     "sho": 68,
     "pas": 60,
     "dri": 73,
     "def": 28,
     "phy": 61
    }
   },
   {
    "id": "didden_m",
    "name": "Matisse Didden",
    "nat": "Belgium",
    "pos": "CB",
    "ovr": 70,
    "stats": {
     "pac": 56,
     "sho": 37,
     "pas": 58,
     "dri": 56,
     "def": 69,
     "phy": 80
    }
   },
   {
    "id": "jensen_v",
    "name": "Victor Jensen",
    "nat": "Denmark",
    "pos": "CM",
    "ovr": 69,
    "stats": {
     "pac": 69,
     "sho": 67,
     "pas": 65,
     "dri": 72,
     "def": 55,
     "phy": 64
    }
   },
   {
    "id": "broholm_m",
    "name": "Marius Broholm",
    "nat": "Norway",
    "pos": "RM",
    "ovr": 69,
    "stats": {
     "pac": 74,
     "sho": 63,
     "pas": 64,
     "dri": 68,
     "def": 49,
     "phy": 56
    }
   },
   {
    "id": "zagre_a",
    "name": "Arthur Zagré",
    "nat": "Burkina Faso",
    "pos": "LM",
    "ovr": 68,
    "stats": {
     "pac": 80,
     "sho": 52,
     "pas": 60,
     "dri": 73,
     "def": 61,
     "phy": 58
    }
   },
   {
    "id": "brouwer_m",
    "name": "Michael Brouwer",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 68,
    "stats": {
     "div": 71,
     "han": 67,
     "kic": 65,
     "ref": 67,
     "spd": 26,
     "pos": 64
    }
   },
   {
    "id": "stepanov_a",
    "name": "Artem Stepanov",
    "nat": "Ukraine",
    "pos": "ST",
    "ovr": 68,
    "stats": {
     "pac": 69,
     "sho": 67,
     "pas": 51,
     "dri": 64,
     "def": 26,
     "phy": 71
    }
   },
   {
    "id": "min_d",
    "name": "David Min",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 68,
    "stats": {
     "pac": 76,
     "sho": 66,
     "pas": 53,
     "dri": 60,
     "def": 28,
     "phy": 63
    }
   },
   {
    "id": "berg_d",
    "name": "Davy van den Berg",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 67,
    "stats": {
     "pac": 62,
     "sho": 66,
     "pas": 66,
     "dri": 66,
     "def": 60,
     "phy": 73
    }
   },
   {
    "id": "iqbal_z",
    "name": "Zidane Iqbal",
    "nat": "Iraq",
    "pos": "CM",
    "ovr": 67,
    "stats": {
     "pac": 61,
     "sho": 51,
     "pas": 69,
     "dri": 71,
     "def": 59,
     "phy": 60
    }
   },
   {
    "id": "ohio_n",
    "name": "Noah Ohio",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 67,
    "stats": {
     "pac": 89,
     "sho": 63,
     "pas": 51,
     "dri": 67,
     "def": 25,
     "phy": 69
    }
   },
   {
    "id": "blake_a",
    "name": "Adrian Blake",
    "nat": "England",
    "pos": "LW",
    "ovr": 67,
    "stats": {
     "pac": 77,
     "sho": 64,
     "pas": 59,
     "dri": 70,
     "def": 23,
     "phy": 50
    }
   },
   {
    "id": "offerhaus_g",
    "name": "Guus Offerhaus",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 67,
    "stats": {
     "pac": 63,
     "sho": 37,
     "pas": 52,
     "dri": 47,
     "def": 67,
     "phy": 72
    }
   },
   {
    "id": "vesterlund_n",
    "name": "Niklas Vesterlund",
    "nat": "Denmark",
    "pos": "RM",
    "ovr": 66,
    "stats": {
     "pac": 73,
     "sho": 54,
     "pas": 60,
     "dri": 65,
     "def": 62,
     "phy": 73
    }
   },
   {
    "id": "nwankwo_n",
    "name": "Neville Ogidi Nwankwo",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 66,
    "stats": {
     "pac": 73,
     "sho": 36,
     "pas": 47,
     "dri": 46,
     "def": 65,
     "phy": 76
    }
   },
   {
    "id": "jonathans_m",
    "name": "Milano Jonathans",
    "nat": "Indonesia",
    "pos": "RW",
    "ovr": 66,
    "stats": {
     "pac": 75,
     "sho": 61,
     "pas": 62,
     "dri": 68,
     "def": 23,
     "phy": 54
    }
   },
   {
    "id": "agougil_o",
    "name": "Ouaiid Agougil",
    "nat": "Morocco",
    "pos": "CM",
    "ovr": 62,
    "stats": {
     "pac": 65,
     "sho": 43,
     "pas": 61,
     "dri": 63,
     "def": 56,
     "phy": 60
    }
   },
   {
    "id": "gadellaa_k",
    "name": "Kevin Gadellaa",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 62,
    "stats": {
     "div": 63,
     "han": 62,
     "kic": 58,
     "ref": 63,
     "spd": 28,
     "pos": 59
    }
   },
   {
    "id": "kloosterboer_p",
    "name": "Per Kloosterboer",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 62,
    "stats": {
     "pac": 64,
     "sho": 30,
     "pas": 48,
     "dri": 53,
     "def": 62,
     "phy": 65
    }
   },
   {
    "id": "owen_e",
    "name": "Emmanuel Chigozie Owen",
    "nat": "Germany",
    "pos": "RM",
    "ovr": 60,
    "stats": {
     "pac": 75,
     "sho": 55,
     "pas": 53,
     "dri": 63,
     "def": 38,
     "phy": 50
    }
   },
   {
    "id": "schuldes_j",
    "name": "Jamie Schuldes",
    "nat": "Germany",
    "pos": "CB",
    "ovr": 60,
    "stats": {
     "pac": 59,
     "sho": 27,
     "pas": 49,
     "dri": 47,
     "def": 60,
     "phy": 64
    }
   },
   {
    "id": "eppink_m",
    "name": "Mees Eppink",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 59,
    "stats": {
     "div": 61,
     "han": 58,
     "kic": 57,
     "ref": 61,
     "spd": 32,
     "pos": 52
    }
   },
   {
    "id": "pohl_f",
    "name": "Ferdinand Pohl",
    "nat": "Germany",
    "pos": "CB",
    "ovr": 59,
    "stats": {
     "pac": 53,
     "sho": 34,
     "pas": 48,
     "dri": 47,
     "def": 61,
     "phy": 57
    }
   }
  ]
 },
 {
  "id": "sc_heerenveen",
  "name": "SC Heerenveen",
  "logo": "🔵⚪",
  "squad": [
   {
    "id": "meerveld_r",
    "name": "Ringo Meerveld",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 73,
    "stats": {
     "pac": 80,
     "sho": 67,
     "pas": 69,
     "dri": 77,
     "def": 51,
     "phy": 64
    }
   },
   {
    "id": "trenskow_j",
    "name": "Jacob Trenskow",
    "nat": "Denmark",
    "pos": "RW",
    "ovr": 73,
    "stats": {
     "pac": 75,
     "sho": 70,
     "pas": 69,
     "dri": 73,
     "def": 48,
     "phy": 51
    }
   },
   {
    "id": "zagaritis_v",
    "name": "Vasilios Zagaritis",
    "nat": "Greece",
    "pos": "LB",
    "ovr": 70,
    "stats": {
     "pac": 83,
     "sho": 46,
     "pas": 61,
     "dri": 67,
     "def": 64,
     "phy": 68
    }
   },
   {
    "id": "proper_d",
    "name": "Dirk Proper",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 70,
    "stats": {
     "pac": 54,
     "sho": 56,
     "pas": 65,
     "dri": 74,
     "def": 66,
     "phy": 60
    }
   },
   {
    "id": "braude_o",
    "name": "Oliver Braude",
    "nat": "Norway",
    "pos": "RB",
    "ovr": 69,
    "stats": {
     "pac": 79,
     "sho": 46,
     "pas": 66,
     "dri": 68,
     "def": 61,
     "phy": 70
    }
   },
   {
    "id": "linday_m",
    "name": "Marcus Linday",
    "nat": "Sweden",
    "pos": "CDM",
    "ovr": 69,
    "stats": {
     "pac": 60,
     "sho": 59,
     "pas": 62,
     "dri": 67,
     "def": 64,
     "phy": 77
    }
   },
   {
    "id": "brouwers_l",
    "name": "Luuk Brouwers",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 68,
    "stats": {
     "pac": 63,
     "sho": 65,
     "pas": 66,
     "dri": 67,
     "def": 62,
     "phy": 73
    }
   },
   {
    "id": "klaverboer_b",
    "name": "Bernt Klaverboer",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 68,
    "stats": {
     "div": 69,
     "han": 63,
     "kic": 67,
     "ref": 69,
     "spd": 29,
     "pos": 67
    }
   },
   {
    "id": "willemsen_m",
    "name": "Maas Willemsen",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 68,
    "stats": {
     "pac": 59,
     "sho": 34,
     "pas": 51,
     "dri": 57,
     "def": 68,
     "phy": 73
    }
   },
   {
    "id": "rivera_m",
    "name": "Maxence Rivera",
    "nat": "France",
    "pos": "LW",
    "ovr": 67,
    "stats": {
     "pac": 83,
     "sho": 61,
     "pas": 61,
     "dri": 69,
     "def": 37,
     "phy": 56
    }
   },
   {
    "id": "noppert_a",
    "name": "Andries Noppert",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 67,
    "stats": {
     "div": 68,
     "han": 64,
     "kic": 65,
     "ref": 66,
     "spd": 35,
     "pos": 67
    }
   },
   {
    "id": "smans_l",
    "name": "Levi Smans",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 67,
    "stats": {
     "pac": 69,
     "sho": 62,
     "pas": 63,
     "dri": 69,
     "def": 43,
     "phy": 57
    }
   },
   {
    "id": "vente_d",
    "name": "Dylan Vente",
    "nat": "Suriname",
    "pos": "ST",
    "ovr": 67,
    "stats": {
     "pac": 73,
     "sho": 67,
     "pas": 54,
     "dri": 64,
     "def": 26,
     "phy": 57
    }
   },
   {
    "id": "oyen_l",
    "name": "Luca Oyen",
    "nat": "Belgium",
    "pos": "LW",
    "ovr": 66,
    "stats": {
     "pac": 75,
     "sho": 60,
     "pas": 64,
     "dri": 70,
     "def": 39,
     "phy": 51
    }
   },
   {
    "id": "kersten_s",
    "name": "Sam Kersten",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 66,
    "stats": {
     "pac": 76,
     "sho": 43,
     "pas": 48,
     "dri": 47,
     "def": 63,
     "phy": 77
    }
   },
   {
    "id": "petrov_h",
    "name": "Hristiyan Petrov",
    "nat": "Bulgaria",
    "pos": "CB",
    "ovr": 66,
    "stats": {
     "pac": 63,
     "sho": 34,
     "pas": 49,
     "dri": 43,
     "def": 69,
     "phy": 65
    }
   },
   {
    "id": "hopland_n",
    "name": "Nikolai Hopland",
    "nat": "Norway",
    "pos": "CB",
    "ovr": 65,
    "stats": {
     "pac": 63,
     "sho": 42,
     "pas": 50,
     "dri": 57,
     "def": 65,
     "phy": 70
    }
   },
   {
    "id": "machine_l",
    "name": "Lanroy Machine",
    "nat": "France",
    "pos": "ST",
    "ovr": 65,
    "stats": {
     "pac": 73,
     "sho": 64,
     "pas": 49,
     "dri": 66,
     "def": 25,
     "phy": 66
    }
   },
   {
    "id": "egbring_m",
    "name": "Mats Egbring",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 61,
    "stats": {
     "pac": 57,
     "sho": 35,
     "pas": 56,
     "dri": 57,
     "def": 59,
     "phy": 63
    }
   },
   {
    "id": "bladi_d",
    "name": "Darling Bladi",
    "nat": "France",
    "pos": "LB",
    "ovr": 60,
    "stats": {
     "pac": 60,
     "sho": 26,
     "pas": 53,
     "dri": 63,
     "def": 57,
     "phy": 53
    }
   },
   {
    "id": "courtens_n",
    "name": "Nolhan Courtens",
    "nat": "DR Congo",
    "pos": "CAM",
    "ovr": 58,
    "stats": {
     "pac": 71,
     "sho": 42,
     "pas": 57,
     "dri": 63,
     "def": 39,
     "phy": 39
    }
   },
   {
    "id": "schaken_k",
    "name": "Kirayno Schaken",
    "nat": "Netherlands",
    "pos": "RW",
    "ovr": 57,
    "stats": {
     "pac": 86,
     "sho": 47,
     "pas": 52,
     "dri": 62,
     "def": 28,
     "phy": 38
    }
   }
  ]
 },
 {
  "id": "sparta_rotterdam",
  "name": "Sparta Rotterdam",
  "logo": "🔴⚪",
  "squad": [
   {
    "id": "young_m",
    "name": "Marvin Young",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 70,
    "stats": {
     "pac": 75,
     "sho": 33,
     "pas": 63,
     "dri": 68,
     "def": 70,
     "phy": 72
    }
   },
   {
    "id": "bergen_m",
    "name": "Mitchell van Bergen",
    "nat": "Netherlands",
    "pos": "RM",
    "ovr": 70,
    "stats": {
     "pac": 94,
     "sho": 60,
     "pas": 61,
     "dri": 70,
     "def": 27,
     "phy": 53
    }
   },
   {
    "id": "kuipers_b",
    "name": "Bas Kuipers",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 69,
    "stats": {
     "pac": 67,
     "sho": 44,
     "pas": 64,
     "dri": 67,
     "def": 66,
     "phy": 73
    }
   },
   {
    "id": "mito_s",
    "name": "Shunsuke Mito",
    "nat": "Japan",
    "pos": "LM",
    "ovr": 69,
    "stats": {
     "pac": 83,
     "sho": 62,
     "pas": 60,
     "dri": 73,
     "def": 32,
     "phy": 52
    }
   },
   {
    "id": "quintero_t",
    "name": "Teo Quintero",
    "nat": "Venezuela",
    "pos": "CB",
    "ovr": 69,
    "stats": {
     "pac": 67,
     "sho": 31,
     "pas": 57,
     "dri": 53,
     "def": 67,
     "phy": 78
    }
   },
   {
    "id": "indi_b",
    "name": "Bruno Martins Indi",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 68,
    "stats": {
     "pac": 35,
     "sho": 42,
     "pas": 37,
     "dri": 55,
     "def": 68,
     "phy": 70
    }
   },
   {
    "id": "baas_j",
    "name": "Julian Baas",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 67,
    "stats": {
     "pac": 49,
     "sho": 58,
     "pas": 69,
     "dri": 66,
     "def": 60,
     "phy": 70
    }
   },
   {
    "id": "toornstra_j",
    "name": "Jens Toornstra",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 67,
    "stats": {
     "pac": 37,
     "sho": 68,
     "pas": 71,
     "dri": 65,
     "def": 61,
     "phy": 65
    }
   },
   {
    "id": "martes_l",
    "name": "Lushendry Martes",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 67,
    "stats": {
     "pac": 82,
     "sho": 34,
     "pas": 56,
     "dri": 63,
     "def": 62,
     "phy": 65
    }
   },
   {
    "id": "verschuren_n",
    "name": "Nick Verschuren",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 67,
    "stats": {
     "pac": 64,
     "sho": 29,
     "pas": 46,
     "dri": 53,
     "def": 67,
     "phy": 73
    }
   },
   {
    "id": "santos_a3",
    "name": "Ayoni Santos",
    "nat": "Cape Verde",
    "pos": "CAM",
    "ovr": 66,
    "stats": {
     "pac": 74,
     "sho": 56,
     "pas": 64,
     "dri": 67,
     "def": 59,
     "phy": 64
    }
   },
   {
    "id": "bednarek_f",
    "name": "Filip Bednarek",
    "nat": "Poland",
    "pos": "GK",
    "ovr": 66,
    "stats": {
     "div": 63,
     "han": 64,
     "kic": 65,
     "ref": 63,
     "spd": 44,
     "pos": 66
    }
   },
   {
    "id": "cruijsen_r",
    "name": "Robin van Cruijsen",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 66,
    "stats": {
     "pac": 73,
     "sho": 63,
     "pas": 68,
     "dri": 66,
     "def": 39,
     "phy": 52
    }
   },
   {
    "id": "terho_c",
    "name": "Casper Terho",
    "nat": "Finland",
    "pos": "RM",
    "ovr": 66,
    "stats": {
     "pac": 70,
     "sho": 62,
     "pas": 62,
     "dri": 67,
     "def": 36,
     "phy": 59
    }
   },
   {
    "id": "roaldsy_a",
    "name": "Alwande Roaldsøy",
    "nat": "Norway",
    "pos": "CDM",
    "ovr": 65,
    "stats": {
     "pac": 60,
     "sho": 60,
     "pas": 59,
     "dri": 61,
     "def": 61,
     "phy": 70
    }
   },
   {
    "id": "reith_b",
    "name": "Boyd Reith",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 65,
    "stats": {
     "pac": 66,
     "sho": 37,
     "pas": 59,
     "dri": 59,
     "def": 62,
     "phy": 64
    }
   },
   {
    "id": "orsson_n",
    "name": "Nökkvi Þórsson",
    "nat": "Iceland",
    "pos": "ST",
    "ovr": 65,
    "stats": {
     "pac": 68,
     "sho": 65,
     "pas": 56,
     "dri": 62,
     "def": 29,
     "phy": 61
    }
   },
   {
    "id": "zonneveld_m",
    "name": "Milan Zonneveld",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 65,
    "stats": {
     "pac": 58,
     "sho": 64,
     "pas": 46,
     "dri": 55,
     "def": 30,
     "phy": 70
    }
   },
   {
    "id": "ideho_j",
    "name": "Joel Ideho",
    "nat": "Netherlands",
    "pos": "LM",
    "ovr": 64,
    "stats": {
     "pac": 76,
     "sho": 55,
     "pas": 60,
     "dri": 66,
     "def": 36,
     "phy": 55
    }
   },
   {
    "id": "vianello_g",
    "name": "Giannino Vianello",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 61,
    "stats": {
     "pac": 68,
     "sho": 40,
     "pas": 51,
     "dri": 60,
     "def": 57,
     "phy": 62
    }
   },
   {
    "id": "kuiper_p",
    "name": "Pascal Kuiper",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 59,
    "stats": {
     "div": 62,
     "han": 59,
     "kic": 58,
     "ref": 60,
     "spd": 25,
     "pos": 57
    }
   },
   {
    "id": "meftahi_y",
    "name": "Younes Jaber El Meftahi",
    "nat": "Netherlands",
    "pos": "LM",
    "ovr": 59,
    "stats": {
     "pac": 67,
     "sho": 48,
     "pas": 54,
     "dri": 66,
     "def": 31,
     "phy": 51
    }
   },
   {
    "id": "buur_r",
    "name": "Rik Buur",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 57,
    "stats": {
     "div": 59,
     "han": 53,
     "kic": 61,
     "ref": 60,
     "spd": 28,
     "pos": 57
    }
   },
   {
    "id": "ligt_m",
    "name": "Max de Ligt",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 57,
    "stats": {
     "pac": 56,
     "sho": 30,
     "pas": 42,
     "dri": 42,
     "def": 60,
     "phy": 60
    }
   }
  ]
 },
 {
  "id": "go_ahead_eagles",
  "name": "Go Ahead Eagles",
  "logo": "🟡🔴",
  "squad": [
   {
    "id": "meulensteen_m",
    "name": "Melle Meulensteen",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 74,
    "stats": {
     "pac": 65,
     "sho": 67,
     "pas": 68,
     "dri": 71,
     "def": 72,
     "phy": 76
    }
   },
   {
    "id": "kramer_j",
    "name": "Joris Kramer",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 73,
    "stats": {
     "pac": 59,
     "sho": 36,
     "pas": 57,
     "dri": 56,
     "def": 74,
     "phy": 76
    }
   },
   {
    "id": "haug_k",
    "name": "Kjetil Haug",
    "nat": "Norway",
    "pos": "GK",
    "ovr": 71,
    "stats": {
     "div": 71,
     "han": 68,
     "kic": 68,
     "ref": 73,
     "spd": 43,
     "pos": 71
    }
   },
   {
    "id": "suray_m",
    "name": "Mathis Suray",
    "nat": "Belgium",
    "pos": "LM",
    "ovr": 71,
    "stats": {
     "pac": 64,
     "sho": 70,
     "pas": 68,
     "dri": 72,
     "def": 47,
     "phy": 63
    }
   },
   {
    "id": "edvardsen_v",
    "name": "Victor Edvardsen",
    "nat": "Sweden",
    "pos": "ST",
    "ovr": 70,
    "stats": {
     "pac": 83,
     "sho": 69,
     "pas": 63,
     "dri": 68,
     "def": 28,
     "phy": 78
    }
   },
   {
    "id": "james_d",
    "name": "Dean James",
    "nat": "Indonesia",
    "pos": "LB",
    "ovr": 69,
    "stats": {
     "pac": 80,
     "sho": 56,
     "pas": 63,
     "dri": 65,
     "def": 63,
     "phy": 63
    }
   },
   {
    "id": "nauber_g",
    "name": "Gerrit Nauber",
    "nat": "Germany",
    "pos": "CB",
    "ovr": 69,
    "stats": {
     "pac": 44,
     "sho": 35,
     "pas": 45,
     "dri": 48,
     "def": 70,
     "phy": 73
    }
   },
   {
    "id": "linthorst_e",
    "name": "Evert Linthorst",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 68,
    "stats": {
     "pac": 62,
     "sho": 60,
     "pas": 61,
     "dri": 66,
     "def": 65,
     "phy": 74
    }
   },
   {
    "id": "sampsted_a",
    "name": "Alfons Sampsted",
    "nat": "Iceland",
    "pos": "RB",
    "ovr": 68,
    "stats": {
     "pac": 73,
     "sho": 47,
     "pas": 60,
     "dri": 66,
     "def": 63,
     "phy": 72
    }
   },
   {
    "id": "sigurarson_s",
    "name": "Stefán Ingi Sigurðarson",
    "nat": "Iceland",
    "pos": "ST",
    "ovr": 68,
    "stats": {
     "pac": 55,
     "sho": 68,
     "pas": 55,
     "dri": 61,
     "def": 23,
     "phy": 71
    }
   },
   {
    "id": "tengstedt_s",
    "name": "Søren Tengstedt",
    "nat": "Denmark",
    "pos": "RM",
    "ovr": 67,
    "stats": {
     "pac": 63,
     "sho": 64,
     "pas": 63,
     "dri": 69,
     "def": 24,
     "phy": 63
    }
   },
   {
    "id": "margaret_r",
    "name": "Richonell Margaret",
    "nat": "Suriname",
    "pos": "RM",
    "ovr": 66,
    "stats": {
     "pac": 77,
     "sho": 61,
     "pas": 59,
     "dri": 67,
     "def": 28,
     "phy": 61
    }
   },
   {
    "id": "flataker_e",
    "name": "Erik Flataker",
    "nat": "Norway",
    "pos": "ST",
    "ovr": 66,
    "stats": {
     "pac": 76,
     "sho": 63,
     "pas": 52,
     "dri": 63,
     "def": 19,
     "phy": 66
    }
   },
   {
    "id": "dirksen_j",
    "name": "Julius Dirksen",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 66,
    "stats": {
     "pac": 64,
     "sho": 30,
     "pas": 52,
     "dri": 57,
     "def": 67,
     "phy": 64
    }
   },
   {
    "id": "marsman_n",
    "name": "Nick Marsman",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 65,
    "stats": {
     "div": 63,
     "han": 61,
     "kic": 66,
     "ref": 65,
     "spd": 37,
     "pos": 66
    }
   },
   {
    "id": "galvez_t",
    "name": "Tomas Galvez",
    "nat": "Finland",
    "pos": "LB",
    "ovr": 65,
    "stats": {
     "pac": 79,
     "sho": 39,
     "pas": 58,
     "dri": 60,
     "def": 60,
     "phy": 59
    }
   },
   {
    "id": "baeten_t",
    "name": "Thibo Baeten",
    "nat": "Belgium",
    "pos": "ST",
    "ovr": 64,
    "stats": {
     "pac": 78,
     "sho": 62,
     "pas": 45,
     "dri": 67,
     "def": 40,
     "phy": 62
    }
   },
   {
    "id": "rahmouni_y",
    "name": "Yassir Rahmouni",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 63,
    "stats": {
     "pac": 51,
     "sho": 47,
     "pas": 60,
     "dri": 68,
     "def": 57,
     "phy": 61
    }
   },
   {
    "id": "sivertsen_o",
    "name": "Oskar Sivertsen",
    "nat": "Norway",
    "pos": "LM",
    "ovr": 63,
    "stats": {
     "pac": 78,
     "sho": 58,
     "pas": 57,
     "dri": 65,
     "def": 28,
     "phy": 40
    }
   },
   {
    "id": "zwam_g",
    "name": "Giovanni van Zwam",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 63,
    "stats": {
     "pac": 56,
     "sho": 32,
     "pas": 42,
     "dri": 48,
     "def": 62,
     "phy": 68
    }
   },
   {
    "id": "waayers_e",
    "name": "Eus Waayers",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 61,
    "stats": {
     "pac": 67,
     "sho": 35,
     "pas": 51,
     "dri": 56,
     "def": 57,
     "phy": 60
    }
   },
   {
    "id": "weijenberg_r",
    "name": "Robbin Weijenberg",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 60,
    "stats": {
     "pac": 66,
     "sho": 49,
     "pas": 64,
     "dri": 63,
     "def": 55,
     "phy": 60
    }
   },
   {
    "id": "saathof_p",
    "name": "Pim Saathof",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 57,
    "stats": {
     "pac": 57,
     "sho": 47,
     "pas": 52,
     "dri": 60,
     "def": 58,
     "phy": 51
    }
   },
   {
    "id": "boakye_o",
    "name": "Ofosu Boakye",
    "nat": "Ghana",
    "pos": "ST",
    "ovr": 57,
    "stats": {
     "pac": 60,
     "sho": 57,
     "pas": 49,
     "dri": 60,
     "def": 34,
     "phy": 51
    }
   },
   {
    "id": "verdoni_n",
    "name": "Nando Verdoni",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 57,
    "stats": {
     "div": 56,
     "han": 55,
     "kic": 60,
     "ref": 57,
     "spd": 27,
     "pos": 55
    }
   }
  ]
 },
 {
  "id": "nec_nijmegen",
  "name": "NEC Nijmegen",
  "logo": "🟢🔴",
  "squad": [
   {
    "id": "tadic_d",
    "name": "Dušan Tadić",
    "nat": "Serbia",
    "pos": "CAM",
    "ovr": 79,
    "stats": {
     "pac": 56,
     "sho": 73,
     "pas": 84,
     "dri": 80,
     "def": 43,
     "phy": 74
    }
   },
   {
    "id": "schuurs_p",
    "name": "Perr Schuurs",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 76,
    "stats": {
     "pac": 68,
     "sho": 64,
     "pas": 71,
     "dri": 66,
     "def": 78,
     "phy": 68
    }
   },
   {
    "id": "nejasmic_d",
    "name": "Darko Nejašmić",
    "nat": "Croatia",
    "pos": "CDM",
    "ovr": 76,
    "stats": {
     "pac": 60,
     "sho": 49,
     "pas": 65,
     "dri": 69,
     "def": 71,
     "phy": 78
    }
   },
   {
    "id": "chery_t",
    "name": "Tjaronn Chery",
    "nat": "Suriname",
    "pos": "CAM",
    "ovr": 75,
    "stats": {
     "pac": 62,
     "sho": 79,
     "pas": 75,
     "dri": 73,
     "def": 29,
     "phy": 71
    }
   },
   {
    "id": "crettaz_g",
    "name": "Gonzalo Crettaz",
    "nat": "Argentina",
    "pos": "GK",
    "ovr": 74,
    "stats": {
     "div": 72,
     "han": 72,
     "kic": 73,
     "ref": 76,
     "spd": 57,
     "pos": 73
    }
   },
   {
    "id": "ouaissa_s",
    "name": "Sami Ouaissa",
    "nat": "Netherlands",
    "pos": "RM",
    "ovr": 74,
    "stats": {
     "pac": 83,
     "sho": 66,
     "pas": 66,
     "dri": 77,
     "def": 40,
     "phy": 68
    }
   },
   {
    "id": "linssen_b",
    "name": "Bryan Linssen",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 74,
    "stats": {
     "pac": 60,
     "sho": 74,
     "pas": 71,
     "dri": 73,
     "def": 46,
     "phy": 69
    }
   },
   {
    "id": "kaplan_a",
    "name": "Ahmetcan Kaplan",
    "nat": "Turkey",
    "pos": "CB",
    "ovr": 74,
    "stats": {
     "pac": 62,
     "sho": 30,
     "pas": 58,
     "dri": 59,
     "def": 74,
     "phy": 78
    }
   },
   {
    "id": "sandler_p",
    "name": "Philippe Sandler",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 73,
    "stats": {
     "pac": 68,
     "sho": 44,
     "pas": 70,
     "dri": 69,
     "def": 72,
     "phy": 77
    }
   },
   {
    "id": "lebreton_n",
    "name": "Noé Lebreton",
    "nat": "France",
    "pos": "CAM",
    "ovr": 72,
    "stats": {
     "pac": 73,
     "sho": 64,
     "pas": 68,
     "dri": 73,
     "def": 66,
     "phy": 77
    }
   },
   {
    "id": "mor_e",
    "name": "Emre Mor",
    "nat": "Turkey",
    "pos": "CAM",
    "ovr": 72,
    "stats": {
     "pac": 83,
     "sho": 65,
     "pas": 65,
     "dri": 82,
     "def": 38,
     "phy": 56
    }
   },
   {
    "id": "polster_n",
    "name": "Nikolas Polster",
    "nat": "Austria",
    "pos": "GK",
    "ovr": 71,
    "stats": {
     "div": 71,
     "han": 68,
     "kic": 66,
     "ref": 72,
     "spd": 19,
     "pos": 69
    }
   },
   {
    "id": "ogawa_k3",
    "name": "Koki Ogawa",
    "nat": "Japan",
    "pos": "ST",
    "ovr": 70,
    "stats": {
     "pac": 50,
     "sho": 71,
     "pas": 57,
     "dri": 67,
     "def": 29,
     "phy": 68
    }
   },
   {
    "id": "ouwejan_t",
    "name": "Thomas Ouwejan",
    "nat": "Netherlands",
    "pos": "LM",
    "ovr": 69,
    "stats": {
     "pac": 68,
     "sho": 62,
     "pas": 71,
     "dri": 69,
     "def": 64,
     "phy": 70
    }
   },
   {
    "id": "monteiro_j",
    "name": "Jamiro Monteiro",
    "nat": "Cape Verde",
    "pos": "CM",
    "ovr": 69,
    "stats": {
     "pac": 71,
     "sho": 59,
     "pas": 70,
     "dri": 72,
     "def": 54,
     "phy": 68
    }
   },
   {
    "id": "fonville_d",
    "name": "Deveron Fonville",
    "nat": "Curaçao",
    "pos": "CB",
    "ovr": 69,
    "stats": {
     "pac": 73,
     "sho": 34,
     "pas": 47,
     "dri": 59,
     "def": 69,
     "phy": 67
    }
   },
   {
    "id": "sierhuis_k",
    "name": "Kaj Sierhuis",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 69,
    "stats": {
     "pac": 54,
     "sho": 72,
     "pas": 56,
     "dri": 66,
     "def": 29,
     "phy": 70
    }
   },
   {
    "id": "bras_g",
    "name": "Gabriel Brás",
    "nat": "Portugal",
    "pos": "CB",
    "ovr": 69,
    "stats": {
     "pac": 63,
     "sho": 32,
     "pas": 35,
     "dri": 50,
     "def": 70,
     "phy": 70
    }
   },
   {
    "id": "willumsson_w",
    "name": "Willum Þór Willumsson",
    "nat": "Iceland",
    "pos": "CAM",
    "ovr": 68,
    "stats": {
     "pac": 54,
     "sho": 67,
     "pas": 69,
     "dri": 69,
     "def": 52,
     "phy": 74
    }
   },
   {
    "id": "crooij_v",
    "name": "Vito van Crooij",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 68,
    "stats": {
     "pac": 69,
     "sho": 66,
     "pas": 68,
     "dri": 67,
     "def": 42,
     "phy": 70
    }
   },
   {
    "id": "nuytinck_b",
    "name": "Bram Nuytinck",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 68,
    "stats": {
     "pac": 39,
     "sho": 40,
     "pas": 51,
     "dri": 47,
     "def": 69,
     "phy": 72
    }
   },
   {
    "id": "bischoff_c",
    "name": "Clement Bischoff",
    "nat": "Denmark",
    "pos": "LM",
    "ovr": 67,
    "stats": {
     "pac": 76,
     "sho": 62,
     "pas": 63,
     "dri": 69,
     "def": 52,
     "phy": 62
    }
   },
   {
    "id": "pereira_b",
    "name": "Brayann Pereira",
    "nat": "France",
    "pos": "CB",
    "ovr": 66,
    "stats": {
     "pac": 82,
     "sho": 41,
     "pas": 58,
     "dri": 67,
     "def": 63,
     "phy": 69
    }
   },
   {
    "id": "tahaut_a",
    "name": "Adam Tahaut",
    "nat": "Morocco",
    "pos": "RM",
    "ovr": 66,
    "stats": {
     "pac": 74,
     "sho": 60,
     "pas": 63,
     "dri": 66,
     "def": 44,
     "phy": 62
    }
   },
   {
    "id": "kabar_a",
    "name": "Almugera Kabar",
    "nat": "Germany",
    "pos": "LB",
    "ovr": 65,
    "stats": {
     "pac": 75,
     "sho": 43,
     "pas": 60,
     "dri": 65,
     "def": 59,
     "phy": 70
    }
   },
   {
    "id": "storm_t",
    "name": "Tobias Storm",
    "nat": "Denmark",
    "pos": "CB",
    "ovr": 64,
    "stats": {
     "pac": 77,
     "sho": 43,
     "pas": 58,
     "dri": 60,
     "def": 63,
     "phy": 72
    }
   },
   {
    "id": "hansen_aaren_i2",
    "name": "Isak Hansen-Aarøen",
    "nat": "Norway",
    "pos": "CAM",
    "ovr": 63,
    "stats": {
     "pac": 70,
     "sho": 51,
     "pas": 61,
     "dri": 68,
     "def": 47,
     "phy": 50
    }
   },
   {
    "id": "moslih_y",
    "name": "Yassin Moslih",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 62,
    "stats": {
     "pac": 57,
     "sho": 28,
     "pas": 45,
     "dri": 49,
     "def": 62,
     "phy": 61
    }
   },
   {
    "id": "sbai_y",
    "name": "Yousri Sbai",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 60,
    "stats": {
     "pac": 74,
     "sho": 41,
     "pas": 50,
     "dri": 63,
     "def": 60,
     "phy": 61
    }
   },
   {
    "id": "laat_s",
    "name": "Sam de Laat",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 59,
    "stats": {
     "pac": 63,
     "sho": 44,
     "pas": 58,
     "dri": 60,
     "def": 47,
     "phy": 57
    }
   },
   {
    "id": "kers_k",
    "name": "Kevin Kers",
    "nat": "Netherlands",
    "pos": "LM",
    "ovr": 59,
    "stats": {
     "pac": 68,
     "sho": 55,
     "pas": 54,
     "dri": 58,
     "def": 33,
     "phy": 54
    }
   },
   {
    "id": "wiel_m",
    "name": "Merijn van de Wiel",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 58,
    "stats": {
     "pac": 64,
     "sho": 43,
     "pas": 54,
     "dri": 57,
     "def": 59,
     "phy": 56
    }
   },
   {
    "id": "entius_f",
    "name": "Freek Entius",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 58,
    "stats": {
     "div": 58,
     "han": 54,
     "kic": 57,
     "ref": 59,
     "spd": 20,
     "pos": 55
    }
   },
   {
    "id": "gemeste_j",
    "name": "Joep Gemeste",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 55,
    "stats": {
     "div": 54,
     "han": 53,
     "kic": 55,
     "ref": 59,
     "spd": 22,
     "pos": 59
    }
   }
  ]
 },
 {
  "id": "fc_groningen",
  "name": "FC Groningen",
  "logo": "🟢⚪",
  "squad": [
   {
    "id": "ondrejka_j",
    "name": "Jacob Ondrejka",
    "nat": "Sweden",
    "pos": "LW",
    "ovr": 73,
    "stats": {
     "pac": 75,
     "sho": 72,
     "pas": 71,
     "dri": 73,
     "def": 46,
     "phy": 51
    }
   },
   {
    "id": "blokzijl_t",
    "name": "Thijmen Blokzijl",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 72,
    "stats": {
     "pac": 61,
     "sho": 32,
     "pas": 57,
     "dri": 59,
     "def": 72,
     "phy": 73
    }
   },
   {
    "id": "vaessen_e",
    "name": "Etienne Vaessen",
    "nat": "Suriname",
    "pos": "GK",
    "ovr": 71,
    "stats": {
     "div": 71,
     "han": 69,
     "kic": 70,
     "ref": 74,
     "spd": 63,
     "pos": 70
    }
   },
   {
    "id": "csinger_m",
    "name": "Márk Csinger",
    "nat": "Hungary",
    "pos": "CB",
    "ovr": 69,
    "stats": {
     "pac": 71,
     "sho": 27,
     "pas": 48,
     "dri": 50,
     "def": 69,
     "phy": 70
    }
   },
   {
    "id": "schreuders_j",
    "name": "Jorg Schreuders",
    "nat": "Netherlands",
    "pos": "LM",
    "ovr": 68,
    "stats": {
     "pac": 72,
     "sho": 63,
     "pas": 62,
     "dri": 67,
     "def": 60,
     "phy": 69
    }
   },
   {
    "id": "bergen_t",
    "name": "Thom van Bergen",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 68,
    "stats": {
     "pac": 77,
     "sho": 63,
     "pas": 56,
     "dri": 70,
     "def": 46,
     "phy": 74
    }
   },
   {
    "id": "rente_m",
    "name": "Marco Rente",
    "nat": "Germany",
    "pos": "RB",
    "ovr": 68,
    "stats": {
     "pac": 83,
     "sho": 31,
     "pas": 53,
     "dri": 53,
     "def": 67,
     "phy": 79
    }
   },
   {
    "id": "land_t",
    "name": "Tygo Land",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 68,
    "stats": {
     "pac": 69,
     "sho": 53,
     "pas": 71,
     "dri": 75,
     "def": 53,
     "phy": 44
    }
   },
   {
    "id": "clement_p",
    "name": "Pelle Clement",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 67,
    "stats": {
     "pac": 65,
     "sho": 61,
     "pas": 70,
     "dri": 67,
     "def": 59,
     "phy": 62
    }
   },
   {
    "id": "jonge_t",
    "name": "Tika de Jonge",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 67,
    "stats": {
     "pac": 60,
     "sho": 58,
     "pas": 67,
     "dri": 68,
     "def": 63,
     "phy": 63
    }
   },
   {
    "id": "willumsson_b",
    "name": "Brynjólfur Willumsson",
    "nat": "Iceland",
    "pos": "ST",
    "ovr": 67,
    "stats": {
     "pac": 53,
     "sho": 69,
     "pas": 56,
     "dri": 65,
     "def": 38,
     "phy": 72
    }
   },
   {
    "id": "jeng_m",
    "name": "Malcolm Jeng",
    "nat": "Sweden",
    "pos": "CB",
    "ovr": 67,
    "stats": {
     "pac": 68,
     "sho": 32,
     "pas": 54,
     "dri": 60,
     "def": 67,
     "phy": 70
    }
   },
   {
    "id": "werff_d",
    "name": "David van der Werff",
    "nat": "Netherlands",
    "pos": "RM",
    "ovr": 66,
    "stats": {
     "pac": 61,
     "sho": 38,
     "pas": 68,
     "dri": 67,
     "def": 46,
     "phy": 62
    }
   },
   {
    "id": "zawada_o",
    "name": "Oskar Zawada",
    "nat": "Poland",
    "pos": "ST",
    "ovr": 66,
    "stats": {
     "pac": 63,
     "sho": 63,
     "pas": 55,
     "dri": 58,
     "def": 38,
     "phy": 69
    }
   },
   {
    "id": "mercera_t",
    "name": "Tyrique Mercera",
    "nat": "Curaçao",
    "pos": "RB",
    "ovr": 64,
    "stats": {
     "pac": 83,
     "sho": 44,
     "pas": 55,
     "dri": 62,
     "def": 58,
     "phy": 63
    }
   },
   {
    "id": "prins_w",
    "name": "Wouter Prins",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 64,
    "stats": {
     "pac": 70,
     "sho": 29,
     "pas": 52,
     "dri": 61,
     "def": 61,
     "phy": 61
    }
   },
   {
    "id": "hernes_t",
    "name": "Travis Hernes",
    "nat": "Norway",
    "pos": "CM",
    "ovr": 63,
    "stats": {
     "pac": 66,
     "sho": 53,
     "pas": 60,
     "dri": 66,
     "def": 55,
     "phy": 61
    }
   },
   {
    "id": "eggens_n",
    "name": "Nils Eggens",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 63,
    "stats": {
     "pac": 68,
     "sho": 63,
     "pas": 50,
     "dri": 57,
     "def": 25,
     "phy": 66
    }
   },
   {
    "id": "stubljar_l",
    "name": "Lovro Štubljar",
    "nat": "Slovenia",
    "pos": "GK",
    "ovr": 62,
    "stats": {
     "div": 63,
     "han": 61,
     "kic": 62,
     "ref": 64,
     "spd": 21,
     "pos": 61
    }
   },
   {
    "id": "emeran_n",
    "name": "Noam Emeran",
    "nat": "Rwanda",
    "pos": "LM",
    "ovr": 61,
    "stats": {
     "pac": 75,
     "sho": 57,
     "pas": 58,
     "dri": 63,
     "def": 31,
     "phy": 53
    }
   },
   {
    "id": "janse_r",
    "name": "Rijk Janse",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 59,
    "stats": {
     "div": 60,
     "han": 55,
     "kic": 56,
     "ref": 58,
     "spd": 26,
     "pos": 58
    }
   },
   {
    "id": "laan_e",
    "name": "Elvis van der Laan",
    "nat": "Sweden",
    "pos": "CB",
    "ovr": 58,
    "stats": {
     "pac": 54,
     "sho": 24,
     "pas": 40,
     "dri": 53,
     "def": 58,
     "phy": 61
    }
   },
   {
    "id": "metu_r",
    "name": "Ryan Metu",
    "nat": "Netherlands",
    "pos": "LM",
    "ovr": 57,
    "stats": {
     "pac": 71,
     "sho": 49,
     "pas": 53,
     "dri": 63,
     "def": 27,
     "phy": 36
    }
   }
  ]
 },
 {
  "id": "pec_zwolle",
  "name": "PEC Zwolle",
  "logo": "🔵⚪",
  "squad": [
   {
    "id": "viergever_n",
    "name": "Nick Viergever",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 71,
    "stats": {
     "pac": 57,
     "sho": 53,
     "pas": 63,
     "dri": 63,
     "def": 70,
     "phy": 73
    }
   },
   {
    "id": "schendelaar_j",
    "name": "Jasper Schendelaar",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 71,
    "stats": {
     "div": 72,
     "han": 69,
     "kic": 66,
     "ref": 74,
     "spd": 25,
     "pos": 69
    }
   },
   {
    "id": "namli_y",
    "name": "Younes Namli",
    "nat": "Denmark",
    "pos": "RM",
    "ovr": 71,
    "stats": {
     "pac": 62,
     "sho": 64,
     "pas": 71,
     "dri": 74,
     "def": 44,
     "phy": 59
    }
   },
   {
    "id": "sommer_t",
    "name": "Tobias Sommer",
    "nat": "Denmark",
    "pos": "CDM",
    "ovr": 68,
    "stats": {
     "pac": 65,
     "sho": 47,
     "pas": 60,
     "dri": 65,
     "def": 65,
     "phy": 71
    }
   },
   {
    "id": "graves_s",
    "name": "Simon Graves",
    "nat": "Denmark",
    "pos": "CB",
    "ovr": 68,
    "stats": {
     "pac": 57,
     "sho": 47,
     "pas": 59,
     "dri": 62,
     "def": 68,
     "phy": 74
    }
   },
   {
    "id": "thomas_r",
    "name": "Ryan Thomas",
    "nat": "New Zealand",
    "pos": "CM",
    "ovr": 67,
    "stats": {
     "pac": 55,
     "sho": 57,
     "pas": 68,
     "dri": 69,
     "def": 57,
     "phy": 68
    }
   },
   {
    "id": "graaff_t",
    "name": "Tom de Graaff",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 67,
    "stats": {
     "div": 67,
     "han": 67,
     "kic": 66,
     "ref": 71,
     "spd": 32,
     "pos": 63
    }
   },
   {
    "id": "kostons_k",
    "name": "Koen Kostons",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 67,
    "stats": {
     "pac": 73,
     "sho": 63,
     "pas": 61,
     "dri": 66,
     "def": 29,
     "phy": 70
    }
   },
   {
    "id": "cissoko_i",
    "name": "Ibrahim Cissoko",
    "nat": "Mali",
    "pos": "LM",
    "ovr": 67,
    "stats": {
     "pac": 79,
     "sho": 60,
     "pas": 61,
     "dri": 71,
     "def": 32,
     "phy": 54
    }
   },
   {
    "id": "mbayo_d",
    "name": "Dylan Mbayo",
    "nat": "Belgium",
    "pos": "RM",
    "ovr": 67,
    "stats": {
     "pac": 86,
     "sho": 59,
     "pas": 58,
     "dri": 71,
     "def": 29,
     "phy": 51
    }
   },
   {
    "id": "velanas_o",
    "name": "Odysseus Velanas",
    "nat": "Netherlands",
    "pos": "LM",
    "ovr": 66,
    "stats": {
     "pac": 70,
     "sho": 65,
     "pas": 65,
     "dri": 65,
     "def": 43,
     "phy": 61
    }
   },
   {
    "id": "srensen_e",
    "name": "Elias Sørensen",
    "nat": "Denmark",
    "pos": "LM",
    "ovr": 66,
    "stats": {
     "pac": 76,
     "sho": 65,
     "pas": 62,
     "dri": 63,
     "def": 27,
     "phy": 69
    }
   },
   {
    "id": "oosting_t",
    "name": "Thijs Oosting",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 65,
    "stats": {
     "pac": 64,
     "sho": 66,
     "pas": 65,
     "dri": 66,
     "def": 58,
     "phy": 65
    }
   },
   {
    "id": "floranus_s",
    "name": "Sherel Floranus",
    "nat": "Curaçao",
    "pos": "LB",
    "ovr": 65,
    "stats": {
     "pac": 77,
     "sho": 42,
     "pas": 54,
     "dri": 66,
     "def": 60,
     "phy": 74
    }
   },
   {
    "id": "aertssen_o",
    "name": "Olivier Aertssen",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 65,
    "stats": {
     "pac": 67,
     "sho": 38,
     "pas": 56,
     "dri": 60,
     "def": 65,
     "phy": 69
    }
   },
   {
    "id": "velthuis_t",
    "name": "Tijs Velthuis",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 65,
    "stats": {
     "pac": 62,
     "sho": 30,
     "pas": 46,
     "dri": 40,
     "def": 65,
     "phy": 72
    }
   },
   {
    "id": "fichtinger_n",
    "name": "Nick Fichtinger",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 64,
    "stats": {
     "pac": 56,
     "sho": 50,
     "pas": 58,
     "dri": 62,
     "def": 63,
     "phy": 61
    }
   },
   {
    "id": "haar_d",
    "name": "Damian van der Haar",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 64,
    "stats": {
     "pac": 63,
     "sho": 32,
     "pas": 51,
     "dri": 58,
     "def": 63,
     "phy": 64
    }
   },
   {
    "id": "burger_j",
    "name": "Jan Bürger",
    "nat": "Germany",
    "pos": "RB",
    "ovr": 63,
    "stats": {
     "pac": 75,
     "sho": 47,
     "pas": 51,
     "dri": 62,
     "def": 59,
     "phy": 60
    }
   },
   {
    "id": "reitzger_g",
    "name": "Gabriël Reitzger",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 62,
    "stats": {
     "pac": 76,
     "sho": 61,
     "pas": 55,
     "dri": 68,
     "def": 43,
     "phy": 49
    }
   },
   {
    "id": "rahajaan_g",
    "name": "Givaro Rahajaän",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 60,
    "stats": {
     "pac": 75,
     "sho": 49,
     "pas": 58,
     "dri": 67,
     "def": 41,
     "phy": 42
    }
   },
   {
    "id": "wal_g",
    "name": "Gilles van der Wal",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 59,
    "stats": {
     "pac": 56,
     "sho": 56,
     "pas": 61,
     "dri": 61,
     "def": 44,
     "phy": 47
    }
   },
   {
    "id": "verduin_d",
    "name": "Duke Verduin",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 57,
    "stats": {
     "div": 57,
     "han": 56,
     "kic": 50,
     "ref": 57,
     "spd": 31,
     "pos": 57
    }
   }
  ]
 },
 {
  "id": "fortuna_sittard",
  "name": "Fortuna Sittard",
  "logo": "🟢🟡",
  "squad": [
   {
    "id": "ihattaren_m",
    "name": "Mohamed Ihattaren",
    "nat": "Morocco",
    "pos": "CAM",
    "ovr": 74,
    "stats": {
     "pac": 64,
     "sho": 71,
     "pas": 75,
     "dri": 76,
     "def": 41,
     "phy": 70
    }
   },
   {
    "id": "branderhorst_m",
    "name": "Mattijs Branderhorst",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 71,
    "stats": {
     "div": 72,
     "han": 69,
     "kic": 66,
     "ref": 72,
     "spd": 40,
     "pos": 70
    }
   },
   {
    "id": "guth_r",
    "name": "Rodrigo Guth",
    "nat": "Brazil",
    "pos": "CB",
    "ovr": 69,
    "stats": {
     "pac": 67,
     "sho": 38,
     "pas": 51,
     "dri": 52,
     "def": 70,
     "phy": 71
    }
   },
   {
    "id": "marquez_i",
    "name": "Iván Márquez",
    "nat": "Spain",
    "pos": "CB",
    "ovr": 69,
    "stats": {
     "pac": 47,
     "sho": 43,
     "pas": 50,
     "dri": 49,
     "def": 69,
     "phy": 76
    }
   },
   {
    "id": "brittijn_p",
    "name": "Philip Brittijn",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 68,
    "stats": {
     "pac": 70,
     "sho": 61,
     "pas": 64,
     "dri": 66,
     "def": 65,
     "phy": 67
    }
   },
   {
    "id": "michut_e",
    "name": "Édouard Michut",
    "nat": "France",
    "pos": "CDM",
    "ovr": 68,
    "stats": {
     "pac": 66,
     "sho": 57,
     "pas": 68,
     "dri": 73,
     "def": 61,
     "phy": 65
    }
   },
   {
    "id": "pinto_i",
    "name": "Ivo Pinto",
    "nat": "Portugal",
    "pos": "RB",
    "ovr": 68,
    "stats": {
     "pac": 76,
     "sho": 46,
     "pas": 63,
     "dri": 64,
     "def": 62,
     "phy": 74
    }
   },
   {
    "id": "oukili_y",
    "name": "Yassin Oukili",
    "nat": "Morocco",
    "pos": "CM",
    "ovr": 67,
    "stats": {
     "pac": 58,
     "sho": 67,
     "pas": 64,
     "dri": 64,
     "def": 59,
     "phy": 77
    }
   },
   {
    "id": "peterson_k",
    "name": "Kristoffer Peterson",
    "nat": "Sweden",
    "pos": "LM",
    "ovr": 67,
    "stats": {
     "pac": 77,
     "sho": 68,
     "pas": 63,
     "dri": 68,
     "def": 34,
     "phy": 64
    }
   },
   {
    "id": "romeny_o",
    "name": "Ole Romeny",
    "nat": "Indonesia",
    "pos": "CAM",
    "ovr": 67,
    "stats": {
     "pac": 68,
     "sho": 69,
     "pas": 62,
     "dri": 68,
     "def": 31,
     "phy": 67
    }
   },
   {
    "id": "ottele_s",
    "name": "Syb van Ottele",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 67,
    "stats": {
     "pac": 56,
     "sho": 36,
     "pas": 51,
     "dri": 49,
     "def": 68,
     "phy": 71
    }
   },
   {
    "id": "dahlhaus_j",
    "name": "Jasper Dahlhaus",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 66,
    "stats": {
     "pac": 75,
     "sho": 59,
     "pas": 60,
     "dri": 68,
     "def": 59,
     "phy": 61
    }
   },
   {
    "id": "zand_s",
    "name": "Shiloh 't Zand",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 66,
    "stats": {
     "pac": 63,
     "sho": 67,
     "pas": 63,
     "dri": 70,
     "def": 51,
     "phy": 65
    }
   },
   {
    "id": "koopmans_l",
    "name": "Luuk Koopmans",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 66,
    "stats": {
     "div": 66,
     "han": 65,
     "kic": 64,
     "ref": 66,
     "spd": 34,
     "pos": 65
    }
   },
   {
    "id": "descotte_a",
    "name": "Anthony Descotte",
    "nat": "Belgium",
    "pos": "ST",
    "ovr": 65,
    "stats": {
     "pac": 76,
     "sho": 68,
     "pas": 55,
     "dri": 70,
     "def": 29,
     "phy": 61
    }
   },
   {
    "id": "zeefuik_l",
    "name": "Lequincio Zeefuik",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 65,
    "stats": {
     "pac": 80,
     "sho": 64,
     "pas": 49,
     "dri": 63,
     "def": 26,
     "phy": 73
    }
   },
   {
    "id": "hubner_j",
    "name": "Justin Hubner",
    "nat": "Indonesia",
    "pos": "CB",
    "ovr": 65,
    "stats": {
     "pac": 60,
     "sho": 40,
     "pas": 54,
     "dri": 56,
     "def": 64,
     "phy": 73
    }
   },
   {
    "id": "groot_n",
    "name": "Nick de Groot",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 64,
    "stats": {
     "pac": 67,
     "sho": 54,
     "pas": 55,
     "dri": 60,
     "def": 62,
     "phy": 65
    }
   },
   {
    "id": "wylin_s",
    "name": "Siebe Wylin",
    "nat": "Belgium",
    "pos": "RB",
    "ovr": 63,
    "stats": {
     "pac": 72,
     "sho": 37,
     "pas": 55,
     "dri": 63,
     "def": 58,
     "phy": 61
    }
   },
   {
    "id": "reitmaier_k",
    "name": "Kaylen Reitmaier",
    "nat": "Germany",
    "pos": "GK",
    "ovr": 58,
    "stats": {
     "div": 60,
     "han": 57,
     "kic": 56,
     "ref": 58,
     "spd": 36,
     "pos": 58
    }
   },
   {
    "id": "gbemou_m",
    "name": "Moussa Gbemou",
    "nat": "Belgium",
    "pos": "CAM",
    "ovr": 58,
    "stats": {
     "pac": 67,
     "sho": 48,
     "pas": 53,
     "dri": 64,
     "def": 37,
     "phy": 53
    }
   }
  ]
 },
 {
  "id": "willem_ii",
  "name": "Willem II",
  "logo": "🔴🔵",
  "squad": [
   {
    "id": "haen_d",
    "name": "Devin Haen",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 70,
    "stats": {
     "pac": 80,
     "sho": 70,
     "pas": 50,
     "dri": 66,
     "def": 24,
     "phy": 57
    }
   },
   {
    "id": "didillon_hodl_t2",
    "name": "Thomas Didillon-Hödl",
    "nat": "France",
    "pos": "GK",
    "ovr": 68,
    "stats": {
     "div": 68,
     "han": 66,
     "kic": 68,
     "ref": 70,
     "spd": 56,
     "pos": 68
    }
   },
   {
    "id": "hoogma_j",
    "name": "Justin Hoogma",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 68,
    "stats": {
     "pac": 32,
     "sho": 29,
     "pas": 32,
     "dri": 57,
     "def": 67,
     "phy": 74
    }
   },
   {
    "id": "avest_h",
    "name": "Hidde ter Avest",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 67,
    "stats": {
     "pac": 69,
     "sho": 52,
     "pas": 63,
     "dri": 65,
     "def": 64,
     "phy": 71
    }
   },
   {
    "id": "twigt_c",
    "name": "Calvin Twigt",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 66,
    "stats": {
     "pac": 54,
     "sho": 59,
     "pas": 67,
     "dri": 63,
     "def": 60,
     "phy": 68
    }
   },
   {
    "id": "boogaard_k",
    "name": "Kasper Boogaard",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 66,
    "stats": {
     "pac": 43,
     "sho": 48,
     "pas": 60,
     "dri": 64,
     "def": 64,
     "phy": 69
    }
   },
   {
    "id": "slory_j",
    "name": "Jaden Slory",
    "nat": "Netherlands",
    "pos": "RM",
    "ovr": 66,
    "stats": {
     "pac": 84,
     "sho": 58,
     "pas": 57,
     "dri": 70,
     "def": 28,
     "phy": 46
    }
   },
   {
    "id": "verheydt_t",
    "name": "Thomas Verheydt",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 66,
    "stats": {
     "pac": 58,
     "sho": 60,
     "pas": 44,
     "dri": 57,
     "def": 34,
     "phy": 80
    }
   },
   {
    "id": "ciranni_a",
    "name": "Alessandro Ciranni",
    "nat": "Belgium",
    "pos": "RB",
    "ovr": 65,
    "stats": {
     "pac": 73,
     "sho": 57,
     "pas": 62,
     "dri": 63,
     "def": 60,
     "phy": 63
    }
   },
   {
    "id": "lemmens_m",
    "name": "Mats Lemmens",
    "nat": "Belgium",
    "pos": "CB",
    "ovr": 65,
    "stats": {
     "pac": 71,
     "sho": 47,
     "pas": 56,
     "dri": 53,
     "def": 64,
     "phy": 71
    }
   },
   {
    "id": "tjoe_a_on_n2",
    "name": "Nathan Tjoe-A-On",
    "nat": "Indonesia",
    "pos": "LB",
    "ovr": 65,
    "stats": {
     "pac": 76,
     "sho": 39,
     "pas": 57,
     "dri": 57,
     "def": 58,
     "phy": 68
    }
   },
   {
    "id": "lachkar_a",
    "name": "Amine Lachkar",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 64,
    "stats": {
     "pac": 58,
     "sho": 49,
     "pas": 63,
     "dri": 61,
     "def": 60,
     "phy": 66
    }
   },
   {
    "id": "schuurman_j",
    "name": "Jari Schuurman",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 64,
    "stats": {
     "pac": 69,
     "sho": 65,
     "pas": 61,
     "dri": 65,
     "def": 43,
     "phy": 49
    }
   },
   {
    "id": "stam_f",
    "name": "Finn Stam",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 64,
    "stats": {
     "pac": 59,
     "sho": 37,
     "pas": 55,
     "dri": 47,
     "def": 63,
     "phy": 68
    }
   },
   {
    "id": "aalst_u",
    "name": "Uriël van Aalst",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 63,
    "stats": {
     "pac": 72,
     "sho": 34,
     "pas": 59,
     "dri": 65,
     "def": 43,
     "phy": 52
    }
   },
   {
    "id": "et_taibi_a2",
    "name": "Amine Et-Taibi",
    "nat": "Morocco",
    "pos": "RB",
    "ovr": 63,
    "stats": {
     "pac": 72,
     "sho": 29,
     "pas": 52,
     "dri": 59,
     "def": 62,
     "phy": 67
    }
   },
   {
    "id": "culum_a",
    "name": "Armin Ćulum",
    "nat": "Sweden",
    "pos": "LM",
    "ovr": 63,
    "stats": {
     "pac": 67,
     "sho": 61,
     "pas": 54,
     "dri": 68,
     "def": 27,
     "phy": 43
    }
   },
   {
    "id": "loon_p",
    "name": "Per van Loon",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 62,
    "stats": {
     "pac": 66,
     "sho": 55,
     "pas": 54,
     "dri": 63,
     "def": 59,
     "phy": 42
    }
   },
   {
    "id": "gurbuz_e",
    "name": "Eser Gürbüz",
    "nat": "Netherlands",
    "pos": "RM",
    "ovr": 62,
    "stats": {
     "pac": 66,
     "sho": 54,
     "pas": 57,
     "dri": 67,
     "def": 28,
     "phy": 32
    }
   },
   {
    "id": "zarrouk_a",
    "name": "Anass Zarrouk",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 61,
    "stats": {
     "pac": 65,
     "sho": 44,
     "pas": 55,
     "dri": 59,
     "def": 59,
     "phy": 62
    }
   },
   {
    "id": "mathijsen_j",
    "name": "Jens Mathijsen",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 60,
    "stats": {
     "pac": 58,
     "sho": 30,
     "pas": 48,
     "dri": 47,
     "def": 61,
     "phy": 59
    }
   },
   {
    "id": "steen_w",
    "name": "Wouter van der Steen",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 57,
    "stats": {
     "div": 51,
     "han": 52,
     "kic": 57,
     "ref": 60,
     "spd": 29,
     "pos": 62
    }
   },
   {
    "id": "abildgaard_l",
    "name": "Lasse Abildgaard",
    "nat": "Denmark",
    "pos": "RM",
    "ovr": 56,
    "stats": {
     "pac": 68,
     "sho": 60,
     "pas": 49,
     "dri": 59,
     "def": 30,
     "phy": 44
    }
   },
   {
    "id": "leeuw_k",
    "name": "Karst de Leeuw",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 55,
    "stats": {
     "div": 57,
     "han": 55,
     "kic": 52,
     "ref": 57,
     "spd": 21,
     "pos": 53
    }
   },
   {
    "id": "esdonk_j",
    "name": "Julian van Esdonk",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 54,
    "stats": {
     "pac": 68,
     "sho": 43,
     "pas": 52,
     "dri": 54,
     "def": 47,
     "phy": 50
    }
   }
  ]
 },
 {
  "id": "excelsior",
  "name": "Excelsior",
  "logo": "🔴⚫",
  "squad": [
   {
    "id": "gassel_s",
    "name": "Stijn van Gassel",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 71,
    "stats": {
     "div": 72,
     "han": 70,
     "kic": 66,
     "ref": 72,
     "spd": 44,
     "pos": 68
    }
   },
   {
    "id": "widell_c",
    "name": "Casper Widell",
    "nat": "Sweden",
    "pos": "CB",
    "ovr": 70,
    "stats": {
     "pac": 58,
     "sho": 29,
     "pas": 52,
     "dri": 46,
     "def": 70,
     "phy": 80
    }
   },
   {
    "id": "meissen_r",
    "name": "Rick Meissen",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 69,
    "stats": {
     "pac": 59,
     "sho": 34,
     "pas": 44,
     "dri": 48,
     "def": 67,
     "phy": 76
    }
   },
   {
    "id": "jahanbakhsh_a",
    "name": "Alireza Jahanbakhsh",
    "nat": "Iran",
    "pos": "RW",
    "ovr": 68,
    "stats": {
     "pac": 67,
     "sho": 70,
     "pas": 66,
     "dri": 70,
     "def": 47,
     "phy": 73
    }
   },
   {
    "id": "yegoian_i",
    "name": "Irakli Yegoian",
    "nat": "Georgia",
    "pos": "CAM",
    "ovr": 68,
    "stats": {
     "pac": 65,
     "sho": 64,
     "pas": 64,
     "dri": 72,
     "def": 49,
     "phy": 59
    }
   },
   {
    "id": "naujoks_n",
    "name": "Noah Naujoks",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 67,
    "stats": {
     "pac": 75,
     "sho": 62,
     "pas": 62,
     "dri": 64,
     "def": 62,
     "phy": 73
    }
   },
   {
    "id": "hartjes_l",
    "name": "Lennart Hartjes",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 67,
    "stats": {
     "pac": 78,
     "sho": 47,
     "pas": 63,
     "dri": 71,
     "def": 62,
     "phy": 64
    }
   },
   {
    "id": "biai_c",
    "name": "Celton Biai",
    "nat": "Guinea-Bissau",
    "pos": "GK",
    "ovr": 67,
    "stats": {
     "div": 69,
     "han": 64,
     "kic": 65,
     "ref": 68,
     "spd": 22,
     "pos": 64
    }
   },
   {
    "id": "sliti_a",
    "name": "Aymen Sliti",
    "nat": "Netherlands",
    "pos": "LW",
    "ovr": 67,
    "stats": {
     "pac": 87,
     "sho": 58,
     "pas": 59,
     "dri": 71,
     "def": 27,
     "phy": 48
    }
   },
   {
    "id": "tielemans_m",
    "name": "Mathijs Tielemans",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 66,
    "stats": {
     "pac": 66,
     "sho": 61,
     "pas": 64,
     "dri": 67,
     "def": 59,
     "phy": 56
    }
   },
   {
    "id": "plug_j",
    "name": "Jan Plug",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 66,
    "stats": {
     "pac": 72,
     "sho": 48,
     "pas": 59,
     "dri": 57,
     "def": 65,
     "phy": 68
    }
   },
   {
    "id": "vlanen_d",
    "name": "Daniel van Vlanen",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 65,
    "stats": {
     "pac": 63,
     "sho": 50,
     "pas": 64,
     "dri": 59,
     "def": 61,
     "phy": 69
    }
   },
   {
    "id": "bos_k",
    "name": "Kasey Bos",
    "nat": "Australia",
    "pos": "LB",
    "ovr": 65,
    "stats": {
     "pac": 72,
     "sho": 46,
     "pas": 54,
     "dri": 60,
     "def": 64,
     "phy": 54
    }
   },
   {
    "id": "finey_y",
    "name": "Yacqub Finey",
    "nat": "Sweden",
    "pos": "CAM",
    "ovr": 65,
    "stats": {
     "pac": 66,
     "sho": 62,
     "pas": 60,
     "dri": 67,
     "def": 39,
     "phy": 56
    }
   },
   {
    "id": "janssen_s",
    "name": "Simon Janssen",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 64,
    "stats": {
     "pac": 69,
     "sho": 53,
     "pas": 63,
     "dri": 64,
     "def": 58,
     "phy": 60
    }
   },
   {
    "id": "henderikx_s",
    "name": "Stan Henderikx",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 63,
    "stats": {
     "pac": 55,
     "sho": 30,
     "pas": 43,
     "dri": 51,
     "def": 63,
     "phy": 67
    }
   },
   {
    "id": "domi",
    "name": "Domi",
    "nat": "Spain",
    "pos": "ST",
    "ovr": 62,
    "stats": {
     "pac": 68,
     "sho": 62,
     "pas": 47,
     "dri": 64,
     "def": 27,
     "phy": 54
    }
   },
   {
    "id": "martens_n",
    "name": "Nolan Martens",
    "nat": "Belgium",
    "pos": "RB",
    "ovr": 62,
    "stats": {
     "pac": 66,
     "sho": 32,
     "pas": 47,
     "dri": 57,
     "def": 61,
     "phy": 57
    }
   },
   {
    "id": "sulzbacher_v",
    "name": "Valentin Sulzbacher",
    "nat": "Austria",
    "pos": "CM",
    "ovr": 61,
    "stats": {
     "pac": 66,
     "sho": 56,
     "pas": 58,
     "dri": 56,
     "def": 60,
     "phy": 68
    }
   },
   {
    "id": "turay_o",
    "name": "Osman Turay",
    "nat": "Germany",
    "pos": "LB",
    "ovr": 61,
    "stats": {
     "pac": 83,
     "sho": 44,
     "pas": 53,
     "dri": 63,
     "def": 51,
     "phy": 64
    }
   },
   {
    "id": "wetering_m",
    "name": "Marlon van de Wetering",
    "nat": "Jamaica",
    "pos": "RB",
    "ovr": 61,
    "stats": {
     "pac": 66,
     "sho": 30,
     "pas": 48,
     "dri": 57,
     "def": 59,
     "phy": 58
    }
   },
   {
    "id": "garden_d",
    "name": "David Garden",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 60,
    "stats": {
     "pac": 56,
     "sho": 63,
     "pas": 43,
     "dri": 55,
     "def": 20,
     "phy": 65
    }
   },
   {
    "id": "groen_n",
    "name": "Nesto Groen",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 59,
    "stats": {
     "pac": 64,
     "sho": 61,
     "pas": 43,
     "dri": 53,
     "def": 33,
     "phy": 59
    }
   },
   {
    "id": "holla_t",
    "name": "Tijmen Holla",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 58,
    "stats": {
     "div": 58,
     "han": 59,
     "kic": 57,
     "ref": 59,
     "spd": 25,
     "pos": 55
    }
   },
   {
    "id": "cairo_g",
    "name": "Guilliano Cairo",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 58,
    "stats": {
     "pac": 63,
     "sho": 31,
     "pas": 40,
     "dri": 48,
     "def": 60,
     "phy": 58
    }
   }
  ]
 },
 {
  "id": "ado_den_haag",
  "name": "ADO Den Haag",
  "logo": "🟢🟡",
  "squad": [
   {
    "id": "nkiema_k",
    "name": "Kilian Nkiema",
    "nat": "Burkina Faso",
    "pos": "GK",
    "ovr": 68,
    "stats": {
     "div": 69,
     "han": 67,
     "kic": 65,
     "ref": 70,
     "spd": 30,
     "pos": 66
    }
   },
   {
    "id": "kilo_j",
    "name": "Juho Kilo",
    "nat": "Finland",
    "pos": "CDM",
    "ovr": 68,
    "stats": {
     "pac": 62,
     "sho": 35,
     "pas": 58,
     "dri": 54,
     "def": 63,
     "phy": 64
    }
   },
   {
    "id": "barany_d",
    "name": "Donát Bárány",
    "nat": "Hungary",
    "pos": "ST",
    "ovr": 67,
    "stats": {
     "pac": 67,
     "sho": 68,
     "pas": 54,
     "dri": 62,
     "def": 28,
     "phy": 71
    }
   },
   {
    "id": "eduardo_y",
    "name": "Yannick Eduardo",
    "nat": "Czechia",
    "pos": "ST",
    "ovr": 67,
    "stats": {
     "pac": 60,
     "sho": 67,
     "pas": 53,
     "dri": 62,
     "def": 32,
     "phy": 69
    }
   },
   {
    "id": "thiede_n",
    "name": "Niclas Thiede",
    "nat": "Germany",
    "pos": "GK",
    "ovr": 66,
    "stats": {
     "div": 65,
     "han": 63,
     "kic": 61,
     "ref": 70,
     "spd": 44,
     "pos": 64
    }
   },
   {
    "id": "rottier_e",
    "name": "Evan Rottier",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 66,
    "stats": {
     "pac": 79,
     "sho": 64,
     "pas": 53,
     "dri": 67,
     "def": 25,
     "phy": 66
    }
   },
   {
    "id": "mieghem_d",
    "name": "Daryl van Mieghem",
    "nat": "Netherlands",
    "pos": "RM",
    "ovr": 66,
    "stats": {
     "pac": 83,
     "sho": 62,
     "pas": 62,
     "dri": 68,
     "def": 26,
     "phy": 48
    }
   },
   {
    "id": "reischl_l",
    "name": "Luka Reischl",
    "nat": "Austria",
    "pos": "ST",
    "ovr": 66,
    "stats": {
     "pac": 73,
     "sho": 65,
     "pas": 48,
     "dri": 63,
     "def": 18,
     "phy": 58
    }
   },
   {
    "id": "waem_m",
    "name": "Matteo Waem",
    "nat": "Belgium",
    "pos": "CB",
    "ovr": 66,
    "stats": {
     "pac": 61,
     "sho": 24,
     "pas": 40,
     "dri": 44,
     "def": 68,
     "phy": 63
    }
   },
   {
    "id": "zamburek_j",
    "name": "Jan Žambůrek",
    "nat": "Czechia",
    "pos": "CDM",
    "ovr": 65,
    "stats": {
     "pac": 52,
     "sho": 58,
     "pas": 62,
     "dri": 67,
     "def": 60,
     "phy": 69
    }
   },
   {
    "id": "thomas_n",
    "name": "Nigel Thomas",
    "nat": "Curaçao",
    "pos": "RM",
    "ovr": 65,
    "stats": {
     "pac": 82,
     "sho": 59,
     "pas": 58,
     "dri": 69,
     "def": 27,
     "phy": 51
    }
   },
   {
    "id": "peupion_c",
    "name": "Cameron Peupion",
    "nat": "Australia",
    "pos": "LM",
    "ovr": 65,
    "stats": {
     "pac": 71,
     "sho": 51,
     "pas": 61,
     "dri": 65,
     "def": 41,
     "phy": 52
    }
   },
   {
    "id": "bal_j",
    "name": "Jesse Bal",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 65,
    "stats": {
     "pac": 75,
     "sho": 65,
     "pas": 53,
     "dri": 62,
     "def": 21,
     "phy": 63
    }
   },
   {
    "id": "wilhelm_l",
    "name": "Lasse Wilhelm",
    "nat": "Germany",
    "pos": "CB",
    "ovr": 65,
    "stats": {
     "pac": 62,
     "sho": 31,
     "pas": 50,
     "dri": 53,
     "def": 64,
     "phy": 70
    }
   },
   {
    "id": "mulder_p",
    "name": "Pascal Mulder",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 65,
    "stats": {
     "pac": 62,
     "sho": 23,
     "pas": 37,
     "dri": 40,
     "def": 66,
     "phy": 70
    }
   },
   {
    "id": "sylla_s",
    "name": "Sekou Sylla",
    "nat": "Mali",
    "pos": "LB",
    "ovr": 64,
    "stats": {
     "pac": 70,
     "sho": 36,
     "pas": 46,
     "dri": 61,
     "def": 60,
     "phy": 58
    }
   },
   {
    "id": "hokke_m",
    "name": "Milan Hokke",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 64,
    "stats": {
     "pac": 61,
     "sho": 25,
     "pas": 37,
     "dri": 42,
     "def": 64,
     "phy": 70
    }
   },
   {
    "id": "raterink_o",
    "name": "Othniël Raterink",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 63,
    "stats": {
     "pac": 78,
     "sho": 52,
     "pas": 54,
     "dri": 61,
     "def": 57,
     "phy": 65
    }
   },
   {
    "id": "jimenez_m",
    "name": "Mylian Jimenez",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 63,
    "stats": {
     "pac": 65,
     "sho": 51,
     "pas": 58,
     "dri": 59,
     "def": 58,
     "phy": 63
    }
   },
   {
    "id": "hawkins_j",
    "name": "Jalen Hawkins",
    "nat": "USA",
    "pos": "RM",
    "ovr": 61,
    "stats": {
     "pac": 81,
     "sho": 49,
     "pas": 52,
     "dri": 65,
     "def": 30,
     "phy": 43
    }
   },
   {
    "id": "ruijter_e",
    "name": "Elijah de Ruijter",
    "nat": "Netherlands",
    "pos": "LM",
    "ovr": 61,
    "stats": {
     "pac": 76,
     "sho": 57,
     "pas": 52,
     "dri": 63,
     "def": 20,
     "phy": 42
    }
   },
   {
    "id": "bruin_f",
    "name": "Finn de Bruin",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 60,
    "stats": {
     "pac": 66,
     "sho": 52,
     "pas": 57,
     "dri": 60,
     "def": 31,
     "phy": 51
    }
   },
   {
    "id": "loenen_d",
    "name": "Dani van Loenen",
    "nat": "Netherlands",
    "pos": "LW",
    "ovr": 58,
    "stats": {
     "pac": 64,
     "sho": 66,
     "pas": 49,
     "dri": 59,
     "def": 28,
     "phy": 45
    }
   },
   {
    "id": "bergtop_s",
    "name": "Sanylka Bergtop",
    "nat": "Suriname",
    "pos": "RB",
    "ovr": 58,
    "stats": {
     "pac": 68,
     "sho": 26,
     "pas": 44,
     "dri": 53,
     "def": 54,
     "phy": 55
    }
   },
   {
    "id": "kramer_c",
    "name": "Caleb Kramer",
    "nat": "Kenya",
    "pos": "GK",
    "ovr": 56,
    "stats": {
     "div": 58,
     "han": 55,
     "kic": 56,
     "ref": 58,
     "spd": 19,
     "pos": 54
    }
   },
   {
    "id": "eekhout_b",
    "name": "Bem Eekhout",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 55,
    "stats": {
     "div": 59,
     "han": 57,
     "kic": 59,
     "ref": 52,
     "spd": 30,
     "pos": 53
    }
   }
  ]
 },
 {
  "id": "sc_cambuur",
  "name": "SC Cambuur",
  "logo": "🟡⚫",
  "squad": [
   {
    "id": "maertens_m",
    "name": "Mathieu Maertens",
    "nat": "Belgium",
    "pos": "CAM",
    "ovr": 69,
    "stats": {
     "pac": 66,
     "sho": 70,
     "pas": 68,
     "dri": 68,
     "def": 64,
     "phy": 69
    }
   },
   {
    "id": "baouf_i",
    "name": "Ismaël Baouf",
    "nat": "Morocco",
    "pos": "CB",
    "ovr": 69,
    "stats": {
     "pac": 62,
     "sho": 35,
     "pas": 48,
     "dri": 54,
     "def": 69,
     "phy": 67
    }
   },
   {
    "id": "jansen_t",
    "name": "Thijs Jansen",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 68,
    "stats": {
     "div": 70,
     "han": 66,
     "kic": 64,
     "ref": 70,
     "spd": 39,
     "pos": 64
    }
   },
   {
    "id": "amofa_j",
    "name": "Jamal Amofa",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 68,
    "stats": {
     "pac": 75,
     "sho": 34,
     "pas": 50,
     "dri": 65,
     "def": 67,
     "phy": 72
    }
   },
   {
    "id": "bouah_d",
    "name": "Devid Eugene Bouah",
    "nat": "Italy",
    "pos": "RB",
    "ovr": 67,
    "stats": {
     "pac": 69,
     "sho": 42,
     "pas": 63,
     "dri": 63,
     "def": 63,
     "phy": 62
    }
   },
   {
    "id": "hamache_i",
    "name": "Ilyes Hamache",
    "nat": "France",
    "pos": "LB",
    "ovr": 65,
    "stats": {
     "pac": 80,
     "sho": 60,
     "pas": 59,
     "dri": 70,
     "def": 21,
     "phy": 55
    }
   },
   {
    "id": "mulders_r",
    "name": "Rik Mulders",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 65,
    "stats": {
     "pac": 69,
     "sho": 27,
     "pas": 53,
     "dri": 55,
     "def": 63,
     "phy": 50
    }
   },
   {
    "id": "souren_n",
    "name": "Nicky Souren",
    "nat": "Curaçao",
    "pos": "CDM",
    "ovr": 64,
    "stats": {
     "pac": 76,
     "sho": 54,
     "pas": 62,
     "dri": 63,
     "def": 60,
     "phy": 62
    }
   },
   {
    "id": "berkhout_j",
    "name": "Jorn Berkhout",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 64,
    "stats": {
     "pac": 73,
     "sho": 32,
     "pas": 46,
     "dri": 56,
     "def": 65,
     "phy": 63
    }
   },
   {
    "id": "henstra_i",
    "name": "Iwan Henstra",
    "nat": "Netherlands",
    "pos": "RW",
    "ovr": 64,
    "stats": {
     "pac": 66,
     "sho": 62,
     "pas": 57,
     "dri": 65,
     "def": 24,
     "phy": 55
    }
   },
   {
    "id": "bouhoudane_s",
    "name": "Sami Bouhoudane",
    "nat": "Morocco",
    "pos": "ST",
    "ovr": 63,
    "stats": {
     "pac": 67,
     "sho": 63,
     "pas": 43,
     "dri": 60,
     "def": 20,
     "phy": 52
    }
   },
   {
    "id": "jetten_l",
    "name": "Lucas Jetten",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 62,
    "stats": {
     "pac": 87,
     "sho": 43,
     "pas": 56,
     "dri": 67,
     "def": 54,
     "phy": 52
    }
   },
   {
    "id": "arguioui_r",
    "name": "Rafik El Arguioui",
    "nat": "Morocco",
    "pos": "CAM",
    "ovr": 62,
    "stats": {
     "pac": 66,
     "sho": 56,
     "pas": 61,
     "dri": 63,
     "def": 43,
     "phy": 56
    }
   },
   {
    "id": "vink_s",
    "name": "Skye Vink",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 62,
    "stats": {
     "pac": 70,
     "sho": 59,
     "pas": 47,
     "dri": 62,
     "def": 30,
     "phy": 60
    }
   },
   {
    "id": "binder_n",
    "name": "Nicolas Binder",
    "nat": "Austria",
    "pos": "ST",
    "ovr": 62,
    "stats": {
     "pac": 62,
     "sho": 60,
     "pas": 43,
     "dri": 58,
     "def": 27,
     "phy": 76
    }
   },
   {
    "id": "pavert_r",
    "name": "Ryan van de Pavert",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 61,
    "stats": {
     "pac": 70,
     "sho": 46,
     "pas": 57,
     "dri": 66,
     "def": 59,
     "phy": 59
    }
   },
   {
    "id": "visser_d",
    "name": "Daan Visser",
    "nat": "Netherlands",
    "pos": "CDM",
    "ovr": 61,
    "stats": {
     "pac": 65,
     "sho": 35,
     "pas": 53,
     "dri": 50,
     "def": 56,
     "phy": 62
    }
   },
   {
    "id": "kooistra_w",
    "name": "Wiebe Kooistra",
    "nat": "Netherlands",
    "pos": "LW",
    "ovr": 61,
    "stats": {
     "pac": 77,
     "sho": 57,
     "pas": 51,
     "dri": 62,
     "def": 22,
     "phy": 42
    }
   },
   {
    "id": "kvam_f",
    "name": "Fabian Kvam",
    "nat": "Norway",
    "pos": "LW",
    "ovr": 60,
    "stats": {
     "pac": 71,
     "sho": 57,
     "pas": 52,
     "dri": 61,
     "def": 24,
     "phy": 37
    }
   },
   {
    "id": "apakou_e",
    "name": "Ethan Apakou",
    "nat": "France",
    "pos": "CDM",
    "ovr": 59,
    "stats": {
     "pac": 58,
     "sho": 33,
     "pas": 53,
     "dri": 51,
     "def": 56,
     "phy": 57
    }
   },
   {
    "id": "heide_w",
    "name": "Wiebe van der Heide",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 58,
    "stats": {
     "pac": 63,
     "sho": 50,
     "pas": 62,
     "dri": 66,
     "def": 44,
     "phy": 51
    }
   },
   {
    "id": "costarelli_m",
    "name": "Morgan Costarelli",
    "nat": "France",
    "pos": "LB",
    "ovr": 58,
    "stats": {
     "pac": 63,
     "sho": 35,
     "pas": 44,
     "dri": 60,
     "def": 54,
     "phy": 54
    }
   },
   {
    "id": "look_d",
    "name": "Danyello Look",
    "nat": "Netherlands",
    "pos": "LW",
    "ovr": 57,
    "stats": {
     "pac": 74,
     "sho": 61,
     "pas": 49,
     "dri": 58,
     "def": 31,
     "phy": 53
    }
   },
   {
    "id": "meijster_j",
    "name": "Jasper Meijster",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 56,
    "stats": {
     "div": 55,
     "han": 57,
     "kic": 60,
     "ref": 56,
     "spd": 21,
     "pos": 56
    }
   },
   {
    "id": "kaltvaart_m",
    "name": "Matthijs Kaltvaart",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 55,
    "stats": {
     "div": 55,
     "han": 55,
     "kic": 51,
     "ref": 53,
     "spd": 24,
     "pos": 56
    }
   }
  ]
 },
 {
  "id": "telstar",
  "name": "SC Telstar",
  "logo": "🔵🟠",
  "squad": [
   {
    "id": "jr_r",
    "name": "Ronald Koeman Jr.",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 72,
    "stats": {
     "div": 70,
     "han": 71,
     "kic": 80,
     "ref": 72,
     "spd": 29,
     "pos": 70
    }
   },
   {
    "id": "hardeveld_j",
    "name": "Jeff Hardeveld",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 70,
    "stats": {
     "pac": 60,
     "sho": 62,
     "pas": 73,
     "dri": 66,
     "def": 67,
     "phy": 74
    }
   },
   {
    "id": "peersman_m",
    "name": "Marvin Peersman",
    "nat": "Belgium",
    "pos": "CB",
    "ovr": 69,
    "stats": {
     "pac": 70,
     "sho": 48,
     "pas": 58,
     "dri": 62,
     "def": 67,
     "phy": 80
    }
   },
   {
    "id": "rossen_n",
    "name": "Nils Rossen",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 67,
    "stats": {
     "pac": 67,
     "sho": 57,
     "pas": 64,
     "dri": 66,
     "def": 60,
     "phy": 62
    }
   },
   {
    "id": "brouwer_p",
    "name": "Patrick Brouwer",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 66,
    "stats": {
     "pac": 78,
     "sho": 66,
     "pas": 61,
     "dri": 65,
     "def": 52,
     "phy": 67
    }
   },
   {
    "id": "owusu_t",
    "name": "Tyrone Owusu",
    "nat": "Netherlands",
    "pos": "CM",
    "ovr": 66,
    "stats": {
     "pac": 69,
     "sho": 53,
     "pas": 64,
     "dri": 66,
     "def": 64,
     "phy": 71
    }
   },
   {
    "id": "alders_g",
    "name": "Gerald Alders",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 66,
    "stats": {
     "pac": 83,
     "sho": 34,
     "pas": 55,
     "dri": 69,
     "def": 59,
     "phy": 62
    }
   },
   {
    "id": "hetli_s",
    "name": "Soufiane Hetli",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 65,
    "stats": {
     "pac": 78,
     "sho": 63,
     "pas": 56,
     "dri": 68,
     "def": 23,
     "phy": 64
    }
   },
   {
    "id": "mendes_r",
    "name": "Rui Mendes",
    "nat": "Portugal",
    "pos": "RM",
    "ovr": 65,
    "stats": {
     "pac": 75,
     "sho": 66,
     "pas": 56,
     "dri": 67,
     "def": 29,
     "phy": 55
    }
   },
   {
    "id": "valk_s",
    "name": "Sem Valk",
    "nat": "Netherlands",
    "pos": "CB",
    "ovr": 64,
    "stats": {
     "pac": 64,
     "sho": 36,
     "pas": 48,
     "dri": 44,
     "def": 63,
     "phy": 73
    }
   },
   {
    "id": "kuster_h",
    "name": "Harrie Kuster",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 63,
    "stats": {
     "pac": 62,
     "sho": 64,
     "pas": 60,
     "dri": 63,
     "def": 53,
     "phy": 62
    }
   },
   {
    "id": "nwankwo_n2",
    "name": "Nigel Ogidi Nwankwo",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 63,
    "stats": {
     "pac": 76,
     "sho": 44,
     "pas": 54,
     "dri": 62,
     "def": 57,
     "phy": 71
    }
   },
   {
    "id": "reiziger_d",
    "name": "Daan Reiziger",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 63,
    "stats": {
     "div": 59,
     "han": 63,
     "kic": 62,
     "ref": 64,
     "spd": 33,
     "pos": 61
    }
   },
   {
    "id": "demircan_e",
    "name": "Emirhan Demircan",
    "nat": "Turkey",
    "pos": "LM",
    "ovr": 63,
    "stats": {
     "pac": 79,
     "sho": 53,
     "pas": 57,
     "dri": 65,
     "def": 30,
     "phy": 56
    }
   },
   {
    "id": "rust_f",
    "name": "Fabiano Rust",
    "nat": "Netherlands",
    "pos": "CAM",
    "ovr": 62,
    "stats": {
     "pac": 76,
     "sho": 62,
     "pas": 60,
     "dri": 59,
     "def": 46,
     "phy": 48
    }
   },
   {
    "id": "aning_p",
    "name": "Prince Aning",
    "nat": "Netherlands",
    "pos": "LB",
    "ovr": 62,
    "stats": {
     "pac": 82,
     "sho": 39,
     "pas": 54,
     "dri": 68,
     "def": 52,
     "phy": 54
    }
   },
   {
    "id": "seedorf_j",
    "name": "Jelani Seedorf",
    "nat": "Netherlands",
    "pos": "ST",
    "ovr": 62,
    "stats": {
     "pac": 78,
     "sho": 61,
     "pas": 43,
     "dri": 58,
     "def": 22,
     "phy": 72
    }
   },
   {
    "id": "caschili_g",
    "name": "Gabi Caschili",
    "nat": "Netherlands",
    "pos": "RB",
    "ovr": 61,
    "stats": {
     "pac": 66,
     "sho": 47,
     "pas": 58,
     "dri": 67,
     "def": 53,
     "phy": 54
    }
   },
   {
    "id": "oudsten_r",
    "name": "Rojendro Oudsten",
    "nat": "Suriname",
    "pos": "CDM",
    "ovr": 59,
    "stats": {
     "pac": 67,
     "sho": 41,
     "pas": 59,
     "dri": 55,
     "def": 56,
     "phy": 48
    }
   },
   {
    "id": "ahmed_i",
    "name": "Isaiah Ahmed",
    "nat": "Curaçao",
    "pos": "CDM",
    "ovr": 59,
    "stats": {
     "pac": 60,
     "sho": 44,
     "pas": 52,
     "dri": 58,
     "def": 57,
     "phy": 61
    }
   },
   {
    "id": "turay_f",
    "name": "Fofin Turay",
    "nat": "Netherlands",
    "pos": "LM",
    "ovr": 59,
    "stats": {
     "pac": 79,
     "sho": 47,
     "pas": 52,
     "dri": 65,
     "def": 24,
     "phy": 52
    }
   },
   {
    "id": "mulder_f",
    "name": "Finn Mulder",
    "nat": "Netherlands",
    "pos": "GK",
    "ovr": 55,
    "stats": {
     "div": 52,
     "han": 55,
     "kic": 59,
     "ref": 60,
     "spd": 23,
     "pos": 54
    }
   }
  ]
 }
];
module.exports = { EREDIVISIE_TEAMS };
