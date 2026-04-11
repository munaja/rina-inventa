export interface ColDef {
	key: string;
	label: string;
	excelHeader?: string;
	showInTable?: boolean;
}

export interface TableDef {
	table: string;
	label: string;
	columns: ColDef[];
}

const commonCols = (extra: ColDef[]): ColDef[] => [
	{ key: 'code', label: 'Code', excelHeader: 'KIB' },
	{ key: 'bookDate', label: 'Book Date', excelHeader: 'TglBuku', showInTable: false },
	{ key: 'acquisitionDate', label: 'Acquisition Date', excelHeader: 'TglPeroleh', showInTable: false },
	{ key: 'acquisitionValue', label: 'Acquisition Value', excelHeader: 'Perolehan' },
	{ key: 'description', label: 'Description', excelHeader: 'DeskObj' },
	...extra
];

export const TABLE_DEFS: Record<string, TableDef> = {
	land: {
		table: 'land',
		label: 'Tanah',
		columns: commonCols([
			{ key: 'area', label: 'Area', excelHeader: 'Luas' },
			{ key: 'address', label: 'Address', excelHeader: 'Alamat' },
			{ key: 'subDistrict', label: 'Sub District', excelHeader: 'Ketkel', showInTable: false },
			{ key: 'rightStatus', label: 'Right Status', excelHeader: 'StatusHAK', showInTable: false },
			{ key: 'certificateNumber', label: 'Certificate No.', excelHeader: 'NoSert', showInTable: false },
			{ key: 'certificateDate', label: 'Certificate Date', excelHeader: 'TglSert', showInTable: false },
			{ key: 'usage', label: 'Usage', excelHeader: 'Pengunaan', showInTable: false },
			{ key: 'condition', label: 'Condition', excelHeader: 'Kondisi' },
			{ key: 'remarks', label: 'Remarks', excelHeader: 'Keterangan', showInTable: false }
		])
	},
	toolMachine: {
		table: 'toolMachine',
		label: 'Peralatan dan Mesin',
		columns: commonCols([
			{ key: 'brandType', label: 'Brand/Type', excelHeader: 'MerkType' },
			{ key: 'sizeCC', label: 'Size/CC', excelHeader: 'UkuranCC', showInTable: false },
			{ key: 'material', label: 'Material', excelHeader: 'Bahan', showInTable: false },
			{ key: 'color', label: 'Color', excelHeader: 'Warna', showInTable: false },
			{ key: 'factoryNumber', label: 'Factory No.', excelHeader: 'NoPabrik', showInTable: false },
			{ key: 'frameNumber', label: 'Frame No.', excelHeader: 'NoRangka', showInTable: false },
			{ key: 'engineNumber', label: 'Engine No.', excelHeader: 'NoMesin', showInTable: false },
			{ key: 'policeNumber', label: 'Police No.', excelHeader: 'NoPolisi', showInTable: false },
			{ key: 'vehicleRegNumber', label: 'Vehicle Reg No.', excelHeader: 'NoBPKB', showInTable: false },
			{ key: 'condition', label: 'Condition', excelHeader: 'Kondisi' },
			{ key: 'remarks', label: 'Remarks', excelHeader: 'Keterangan', showInTable: false }
		])
	},
	toolSoftware: {
		table: 'toolSoftware',
		label: 'Peralatan Lain',
		columns: commonCols([
			{ key: 'vendor', label: 'Vendor', excelHeader: 'Vendor' },
			{ key: 'usage', label: 'Usage', excelHeader: 'Penggunaan', showInTable: false },
			{ key: 'specification', label: 'Specification', excelHeader: 'Spesifikasi', showInTable: false },
			{ key: 'remarks', label: 'Remarks', excelHeader: 'Keterangan', showInTable: false }
		])
	},
	building: {
		table: 'building',
		label: 'Gedung dan Bangunan',
		columns: commonCols([
			{ key: 'condition', label: 'Condition', excelHeader: 'Kondisi' },
			{ key: 'concrete', label: 'Concrete', excelHeader: 'Beton', showInTable: false },
			{ key: 'floorCount', label: 'Floor Count', excelHeader: 'JmlLantai', showInTable: false },
			{ key: 'address', label: 'Address', excelHeader: 'Alamat' },
			{ key: 'subDistrict', label: 'Sub District', excelHeader: 'KetKel', showInTable: false },
			{ key: 'floorArea', label: 'Floor Area', excelHeader: 'LuasLantai', showInTable: false },
			{ key: 'documentName', label: 'Document Name', excelHeader: 'NMDok', showInTable: false },
			{ key: 'documentNumber', label: 'Document No.', excelHeader: 'NoDok', showInTable: false },
			{ key: 'documentDate', label: 'Document Date', excelHeader: 'TglDok', showInTable: false },
			{ key: 'land_code', label: 'Land Code', excelHeader: 'KIBA', showInTable: false },
			{ key: 'landArea', label: 'Land Area', excelHeader: 'LuasTanah', showInTable: false },
			{ key: 'remarks', label: 'Remarks', excelHeader: 'Keterangan', showInTable: false }
		])
	},
	road: {
		table: 'road',
		label: 'Jalan, Irigasi dan Jaringan',
		columns: commonCols([
			{ key: 'title', label: 'Title', excelHeader: 'Judul' },
			{ key: 'specification', label: 'Specification', excelHeader: 'Spesifikasi', showInTable: false },
			{ key: 'regionOfOrigin', label: 'Region of Origin', excelHeader: 'AsalDaerah', showInTable: false },
			{ key: 'creator', label: 'Creator', excelHeader: 'Pencipta', showInTable: false },
			{ key: 'material', label: 'Material', excelHeader: 'Bahan', showInTable: false },
			{ key: 'type', label: 'Type', excelHeader: 'Jenis', showInTable: false },
			{ key: 'size', label: 'Size', excelHeader: 'Ukuran', showInTable: false },
			{ key: 'quantity', label: 'Quantity', excelHeader: 'Jumlah', showInTable: false },
			{ key: 'year', label: 'Year', excelHeader: 'Tahun', showInTable: false },
			{ key: 'condition', label: 'Condition', excelHeader: 'Kondisi' },
			{ key: 'remarks', label: 'Remarks', excelHeader: 'Keterangan', showInTable: false }
		])
	},
	permanentAsset: {
		table: 'permanentAsset',
		label: 'Aset Tetap Lainnya',
		columns: commonCols([
			{ key: 'title', label: 'Title', excelHeader: 'Judul' },
			{ key: 'specification', label: 'Specification', excelHeader: 'Spesifikasi', showInTable: false },
			{ key: 'regionOfOrigin', label: 'Region of Origin', excelHeader: 'AsalDaerah', showInTable: false },
			{ key: 'creator', label: 'Creator', excelHeader: 'Pencipta', showInTable: false },
			{ key: 'material', label: 'Material', excelHeader: 'Bahan', showInTable: false },
			{ key: 'type', label: 'Type', excelHeader: 'Jenis', showInTable: false },
			{ key: 'size', label: 'Size', excelHeader: 'Ukuran', showInTable: false },
			{ key: 'quantity', label: 'Quantity', excelHeader: 'Jumlah', showInTable: false },
			{ key: 'year', label: 'Year', excelHeader: 'Tahun', showInTable: false },
			{ key: 'condition', label: 'Condition', excelHeader: 'Kondisi' },
			{ key: 'remarks', label: 'Remarks', excelHeader: 'Keterangan', showInTable: false }
		])
	},
	construction: {
		table: 'construction',
		label: 'Konstruksi Dalam Pengerjaan',
		columns: commonCols([
			{ key: 'concrete', label: 'Concrete', excelHeader: 'Beton', showInTable: false },
			{ key: 'floorCount', label: 'Floor Count', excelHeader: 'JmlLantai', showInTable: false },
			{ key: 'address', label: 'Address', excelHeader: 'Alamat' },
			{ key: 'subDistrict', label: 'Sub District', excelHeader: 'KetKel', showInTable: false },
			{ key: 'area', label: 'Area', excelHeader: 'Luas', showInTable: false },
			{ key: 'documentName', label: 'Document Name', excelHeader: 'NMDok', showInTable: false },
			{ key: 'documentNumber', label: 'Document No.', excelHeader: 'NoDok', showInTable: false },
			{ key: 'documentDate', label: 'Document Date', excelHeader: 'TglDok', showInTable: false },
			{ key: 'constructionYear', label: 'Construction Year', excelHeader: 'ThnPengerjaan', showInTable: false },
			{ key: 'completionYear', label: 'Completion Year', excelHeader: 'ThnSelesai', showInTable: false },
			{ key: 'land_code', label: 'Land Code', excelHeader: 'KIBA', showInTable: false },
			{ key: 'condition', label: 'Condition', excelHeader: 'Kondisi' },
			{ key: 'remarks', label: 'Remarks', excelHeader: 'Keterangan', showInTable: false }
		])
	},
	otherAsset: {
		table: 'otherAsset',
		label: 'Aset Lain-Lain',
		columns: [
			{ key: 'code', label: 'Code', excelHeader: 'KIB' },
			{ key: 'codeL', label: 'Code L', excelHeader: 'KIBL', showInTable: false },
			{ key: 'refCode', label: 'Ref Code', excelHeader: 'Kode Barang' },
			{ key: 'name', label: 'Name', excelHeader: 'Nama Barang' },
			{ key: 'specification', label: 'Specification', excelHeader: 'Spesifikasi Barang', showInTable: false },
			{ key: 'acquisitionDate', label: 'Acquisition Date', excelHeader: 'Tgl. Perolehan', showInTable: false },
			{ key: 'bookDate', label: 'Book Date', excelHeader: 'Tgl. Buku', showInTable: false },
			{ key: 'reclassificationDate', label: 'Reclassification Date', excelHeader: 'Tgl. Reklas', showInTable: false },
			{ key: 'quantity', label: 'Quantity', excelHeader: 'Jumlah' },
			{ key: 'acquisitionValue', label: 'Acquisition Value', excelHeader: 'Perolehan' },
			{ key: 'depreciation', label: 'Depreciation', excelHeader: 'Penyusutan', showInTable: false }
		]
	},
	extraAsset: {
		table: 'extraAsset',
		label: 'Aset Ekstrakompt',
		columns: commonCols([
			{ key: 'brandType', label: 'Brand/Type', excelHeader: 'MerkType' },
			{ key: 'sizeCC', label: 'Size/CC', excelHeader: 'UkuranCC', showInTable: false },
			{ key: 'material', label: 'Material', excelHeader: 'Bahan', showInTable: false },
			{ key: 'color', label: 'Color', excelHeader: 'Warna', showInTable: false },
			{ key: 'factoryNumber', label: 'Factory No.', excelHeader: 'NoPabrik', showInTable: false },
			{ key: 'frameNumber', label: 'Frame No.', excelHeader: 'NoRangka', showInTable: false },
			{ key: 'engineNumber', label: 'Engine No.', excelHeader: 'NoMesin', showInTable: false },
			{ key: 'policeNumber', label: 'Police No.', excelHeader: 'NoPolisi', showInTable: false },
			{ key: 'vehicleRegNumber', label: 'Vehicle Reg No.', excelHeader: 'NoBPKB', showInTable: false },
			{ key: 'condition', label: 'Condition', excelHeader: 'Kondisi' },
			{ key: 'remarks', label: 'Remarks', excelHeader: 'Keterangan', showInTable: false }
		])
	}
};

// Map from URL slug (kebab-case) to table key (camelCase)
export const SLUG_TO_TABLE: Record<string, string> = {
	'land': 'land',
	'tool-machine': 'toolMachine',
	'tool-software': 'toolSoftware',
	'building': 'building',
	'road': 'road',
	'permanent-asset': 'permanentAsset',
	'construction': 'construction',
	'other-asset': 'otherAsset',
	'extra-asset': 'extraAsset'
};

// Map from URL slug to Excel file name
export const SLUG_TO_EXCEL: Record<string, string> = {
	'land': '0710 AT-A 2025.xlsx',
	'tool-machine': '0710 AT-B 2025.xlsx',
	'tool-software': '0710 ATB 2025.xlsx',
	'building': '0710 AT-C 2025.xlsx',
	'road': '0710 AT-D 2025.xlsx',
	'permanent-asset': '0710 AT-E 2025.xlsx',
	'construction': '0710 AT-F 2025.xlsx',
	'other-asset': '0710 ASET LAIN-LAIN 2025.xlsx',
	'extra-asset': '0710 ASET EKSTRAKOMPT 2025.xlsx'
};
