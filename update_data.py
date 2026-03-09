import codecs, json, re

iau_data = {
    'and': ['Andromeda', '722', 'Alpheratz (α And)', 'Perseus'],
    'ant': ['Pompa', '239', 'α Ant', 'La Caille'],
    'aps': ['Cennetkuşu', '206', 'α Aps', 'Bayer'],
    'aqr': ['Kova', '980', 'Sadalsuud (β Aqr)', 'Zodyak'],
    'aql': ['Kartal', '652', 'Altair (α Aql)', 'Herkül'],
    'ara': ['Sunak', '237', 'β Ara', 'Herkül'],
    'ari': ['Koç', '441', 'Hamal (α Ari)', 'Zodyak'],
    'aur': ['Arabacı', '657', 'Capella (α Aur)', 'Perseus'],
    'boo': ['Çoban', '907', 'Arcturus (α Boo)', 'Büyük Ayı'],
    'cae': ['Çeliklem', '125', 'α Cae', 'La Caille'],
    'cam': ['Zürafa', '757', 'β Cam', 'Büyük Ayı'],
    'cnc': ['Yengeç', '506', 'Tarf (β Cnc)', 'Zodyak'],
    'cvn': ['Av Köpekleri', '465', 'Cor Caroli (α CVn)', 'Büyük Ayı'],
    'cma': ['Büyük Köpek', '380', 'Sirius (α CMa)', 'Avcı'],
    'cmi': ['Küçük Köpek', '183', 'Procyon (α CMi)', 'Avcı'],
    'cap': ['Oğlak', '414', 'Deneb Algedi (δ Cap)', 'Zodyak'],
    'car': ['Karina', '494', 'Canopus (α Car)', 'Cennet Suları'],
    'cas': ['Kraliçe', '598', 'Schedar (α Cas)', 'Perseus'],
    'cen': ['Erboğa', '1060', 'Rigil Kentaurus (α Cen)', 'Herkül'],
    'cep': ['Kral', '588', 'Alderamin (α Cep)', 'Perseus'],
    'cet': ['Balina', '1231', 'Deneb Kaitos (β Cet)', 'Perseus'],
    'cha': ['Bukalemun', '132', 'α Cha', 'Bayer'],
    'cir': ['Pergel', '93', 'α Cir', 'La Caille'],
    'col': ['Güvercin', '270', 'Phact (α Col)', 'Cennet Suları'],
    'com': ['Berenis\'in Saçı', '386', 'Diadem (α Com)', 'Büyük Ayı'],
    'cra': ['Güney Tâcı', '128', 'Meridiana (α CrA)', 'Herkül'],
    'crb': ['Kuzey Tâcı', '179', 'Alphecca (α CrB)', 'Herkül'],
    'crv': ['Karga', '184', 'Gienah (γ Crv)', 'Herkül'],
    'crt': ['Kupa', '282', 'δ Crt', 'Herkül'],
    'cru': ['Güney Haçı', '68', 'Acrux (α Cru)', 'Herkül'],
    'cyg': ['Kuğu', '804', 'Deneb (α Cyg)', 'Herkül'],
    'del': ['Yunus', '189', 'Rotanev (β Del)', 'Cennet Suları'],
    'dor': ['Kılıçbalığı', '179', 'α Dor', 'Bayer'],
    'dra': ['Ejderha', '1083', 'Eltanin (γ Dra)', 'Büyük Ayı'],
    'equ': ['Tay', '72', 'Kitalpha (α Equ)', 'Cennet Suları'],
    'eri': ['Irmak', '1138', 'Achernar (α Eri)', 'Cennet Suları'],
    'for': ['Ocak', '398', 'Dalim (α For)', 'La Caille'],
    'gem': ['İkizler', '514', 'Pollux (β Gem)', 'Zodyak'],
    'gru': ['Turna', '366', 'Alnair (α Gru)', 'Bayer'],
    'her': ['Herkül', '1225', 'Kornephoros (β Her)', 'Herkül'],
    'hor': ['Saat', '249', 'α Hor', 'La Caille'],
    'hya': ['Su Yılanı', '1303', 'Alphard (α Hya)', 'Herkül'],
    'hyi': ['Küçükyılan', '243', 'β Hyi', 'Bayer'],
    'ind': ['Hintli', '294', 'Peacock (α Ind)', 'Bayer'],
    'lac': ['Kertenkele', '201', 'α Lac', 'Perseus'],
    'leo': ['Aslan', '947', 'Regulus (α Leo)', 'Zodyak'],
    'lmi': ['Küçük Aslan', '232', 'Praecipua (46 LMi)', 'Büyük Ayı'],
    'lep': ['Tavşan', '290', 'Arneb (α Lep)', 'Avcı'],
    'lib': ['Terazi', '538', 'Zubeneschamali (β Lib)', 'Zodyak'],
    'lup': ['Kurt', '334', 'α Lup', 'Herkül'],
    'lyn': ['Vaşak', '545', 'α Lyn', 'Büyük Ayı'],
    'lyr': ['Lir', '286', 'Vega (α Lyr)', 'Herkül'],
    'men': ['Masa Dağı', '153', 'α Men', 'La Caille'],
    'mic': ['Mikroskop', '210', 'γ Mic', 'La Caille'],
    'mon': ['Tekboynuz', '482', 'β Mon', 'Avcı'],
    'mus': ['Sinek', '138', 'α Mus', 'Bayer'],
    'nor': ['Cetvel', '165', 'γ2 Nor', 'La Caille'],
    'oct': ['Sekizlik', '291', 'ν Oct', 'La Caille'],
    'oph': ['Yılancı', '948', 'Rasalhague (α Oph)', 'Herkül'],
    'ori': ['Avcı', '594', 'Rigel (β Ori)', 'Avcı'],
    'pav': ['Tavus', '378', 'Peacock (α Pav)', 'Bayer'],
    'peg': ['Kanatlı At', '1121', 'Enif (ε Peg)', 'Perseus'],
    'per': ['Kahraman', '615', 'Mirfak (α Per)', 'Perseus'],
    'phe': ['Anka', '469', 'Ankaa (α Phe)', 'Bayer'],
    'pic': ['Ressam', '247', 'α Pic', 'La Caille'],
    'psc': ['Balıklar', '889', 'Alpherg (η Psc)', 'Zodyak'],
    'psa': ['Güneybalığı', '245', 'Fomalhaut (α PsA)', 'Cennet Suları'],
    'pup': ['Pupa', '673', 'Naos (ζ Pup)', 'Cennet Suları'],
    'pyx': ['Kumpas', '221', 'α Pyx', 'Cennet Suları'],
    'ret': ['Ağ', '114', 'α Ret', 'La Caille'],
    'sge': ['Okçuk', '80', 'γ Sge', 'Herkül'],
    'sgr': ['Yay', '867', 'Kaus Australis (ε Sgr)', 'Zodyak'],
    'sco': ['Akrep', '497', 'Antares (α Sco)', 'Zodyak'],
    'scl': ['Heykeltıraş', '475', 'α Scl', 'La Caille'],
    'sct': ['Kalkan', '109', 'α Sct', 'Herkül'],
    'ser': ['Yılan', '637', 'Unukalhai (α Ser)', 'Herkül'],
    'sex': ['Altılık', '314', 'α Sex', 'Herkül'],
    'tau': ['Boğa', '797', 'Aldebaran (α Tau)', 'Zodyak'],
    'tel': ['Dürbün', '252', 'α Tel', 'La Caille'],
    'tri': ['Üçgen', '132', 'β Tri', 'Perseus'],
    'tra': ['Güney Üçgeni', '110', 'Atria (α TrA)', 'Herkül'],
    'tuc': ['Tukan', '295', 'α Tuc', 'Bayer'],
    'uma': ['Büyük Ayı', '1280', 'Alioth (ε UMa)', 'Büyük Ayı'],
    'umi': ['Küçük Ayı', '256', 'Polaris (α UMi)', 'Büyük Ayı'],
    'vel': ['Yelken', '500', 'Regor (γ Vel)', 'Cennet Suları'],
    'vir': ['Başak', '1294', 'Spica (α Vir)', 'Zodyak'],
    'vol': ['Uçanbalık', '141', 'β Vol', 'Bayer'],
    'vul': ['Tilkicik', '268', 'Anser (α Vul)', 'Herkül'],
}

try:
    with codecs.open("js/data.js", "r", "utf-8") as f:
        text = f.read()

    match = re.search(r'(const\s+constellationsData\s*=\s*)(\[.*\])(\s*;)', text, re.DOTALL)
    if match:
        prefix = match.group(1)
        json_str = match.group(2)
        suffix = match.group(3)
        
        data = json.loads(json_str)
        
        for c in data:
            cid = c['id']
            if cid in iau_data:
                info = iau_data[cid]
                c['area'] = str(info[1]) + ' sq. deg.'
                c['brightestStar'] = info[2]
                c['family'] = info[3]
                # Improve description
                if "IAU tarafından" in c['description']:
                    c['description'] = f"{c['name']}, gökyüzünde {info[3]} ailesine ait bir takımyıldızdır. En parlak yıldızı {info[2]} olup toplamda {info[1]} derece kare alan kaplar."
            else:
                c['area'] = 'Bilinmiyor'
                c['brightestStar'] = 'Bilinmiyor'
                c['family'] = 'Bilinmiyor'
        
        out_json = json.dumps(data, indent=4, ensure_ascii=False)
        new_text = text[:match.start(2)] + out_json + text[match.end(2):]
        
        with codecs.open("js/data.js", "w", "utf-8") as f:
            f.write(new_text)
        print("data.js successfully enriched!")
    else:
        print("JSON pattern not found in data.js")
except Exception as e:
    print("Error:", e)
