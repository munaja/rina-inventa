export interface User {
	id: number;
	username: string;
	role: 'admin' | 'operator';
	createdAt: string;
	updatedAt: string;
}

export interface Land {
	id: number;
	code: string | null;
	bookDate: string | null;
	acquisitionDate: string | null;
	acquisitionValue: string | null;
	description: string | null;
	area: string | null;
	address: string | null;
	subDistrict: string | null;
	rightStatus: string | null;
	certificateNumber: string | null;
	certificateDate: string | null;
	usage: string | null;
	condition: string | null;
	remarks: string | null;
}

export interface ToolMachine {
	id: number;
	code: string | null;
	bookDate: string | null;
	acquisitionDate: string | null;
	acquisitionValue: string | null;
	description: string | null;
	brandType: string | null;
	sizeCC: string | null;
	material: string | null;
	color: string | null;
	factoryNumber: string | null;
	frameNumber: string | null;
	engineNumber: string | null;
	policeNumber: string | null;
	vehicleRegNumber: string | null;
	condition: string | null;
	remarks: string | null;
}

export interface ToolSoftware {
	id: number;
	code: string | null;
	bookDate: string | null;
	acquisitionDate: string | null;
	acquisitionValue: string | null;
	description: string | null;
	vendor: string | null;
	usage: string | null;
	specification: string | null;
	remarks: string | null;
}

export interface Building {
	id: number;
	code: string | null;
	bookDate: string | null;
	acquisitionDate: string | null;
	acquisitionValue: string | null;
	description: string | null;
	condition: string | null;
	concrete: string | null;
	floorCount: string | null;
	address: string | null;
	subDistrict: string | null;
	floorArea: string | null;
	documentName: string | null;
	documentNumber: string | null;
	documentDate: string | null;
	land_code: string | null;
	landArea: string | null;
	remarks: string | null;
}

export interface Road {
	id: number;
	code: string | null;
	bookDate: string | null;
	acquisitionDate: string | null;
	acquisitionValue: string | null;
	description: string | null;
	title: string | null;
	specification: string | null;
	regionOfOrigin: string | null;
	creator: string | null;
	material: string | null;
	type: string | null;
	size: string | null;
	quantity: string | null;
	year: string | null;
	condition: string | null;
	remarks: string | null;
}

export interface PermanentAsset {
	id: number;
	code: string | null;
	bookDate: string | null;
	acquisitionDate: string | null;
	acquisitionValue: string | null;
	description: string | null;
	title: string | null;
	specification: string | null;
	regionOfOrigin: string | null;
	creator: string | null;
	material: string | null;
	type: string | null;
	size: string | null;
	quantity: string | null;
	year: string | null;
	condition: string | null;
	remarks: string | null;
}

export interface Construction {
	id: number;
	code: string | null;
	bookDate: string | null;
	acquisitionDate: string | null;
	acquisitionValue: string | null;
	description: string | null;
	concrete: string | null;
	floorCount: string | null;
	address: string | null;
	subDistrict: string | null;
	area: string | null;
	documentName: string | null;
	documentNumber: string | null;
	documentDate: string | null;
	constructionYear: string | null;
	completionYear: string | null;
	land_code: string | null;
	condition: string | null;
	remarks: string | null;
}

export interface OtherAsset {
	id: number;
	code: string | null;
	codeL: string | null;
	refCode: string | null;
	name: string | null;
	specification: string | null;
	acquisitionDate: string | null;
	bookDate: string | null;
	reclassificationDate: string | null;
	quantity: string | null;
	acquisitionValue: string | null;
	depreciation: string | null;
}

export interface ExtraAsset {
	id: number;
	code: string | null;
	bookDate: string | null;
	acquisitionDate: string | null;
	acquisitionValue: string | null;
	description: string | null;
	brandType: string | null;
	sizeCC: string | null;
	material: string | null;
	color: string | null;
	factoryNumber: string | null;
	frameNumber: string | null;
	engineNumber: string | null;
	policeNumber: string | null;
	vehicleRegNumber: string | null;
	condition: string | null;
	remarks: string | null;
}

export interface Room {
	id: number;
	building_code: string | null;
	name: string;
	space: string | null;
}

export interface Unit {
	id: number;
	code: string;
	name: string;
}

export interface Inspection {
	id: number;
	date: string;
}

export interface ToolMachineInspection {
	id: number;
	inspection_id: number | null;
	room_id: number | null;
	imgUrl: string | null;
	toolMachine_code: string | null;
	bookDate: string | null;
	acquisitionDate: string | null;
	acquisitionValue: string | null;
	description: string | null;
	brandType: string | null;
	sizeCC: string | null;
	material: string | null;
	color: string | null;
	factoryNumber: string | null;
	frameNumber: string | null;
	engineNumber: string | null;
	policeNumber: string | null;
	vehicleRegNumber: string | null;
	condition: string | null;
	remarks: string | null;
	// Joined fields
	roomName?: string;
	roomSpace?: string;
	inspectionDate?: string;
}

export interface CategoryBucket {
	label: string;
	count: number;
	price: number;
}

export interface RoomSummary {
	roomId: number;
	roomName: string;
	totalCount: number;
	totalPrice: number;
	baikCount: number;
	baikPrice: number;
	rusakRinganCount: number;
	rusakRinganPrice: number;
	rusakBeratCount: number;
	rusakBeratPrice: number;
	categories: CategoryBucket[];
}

// Table configuration for CRUD
export interface TableConfig {
	name: string;
	label: string;
	columns: ColumnConfig[];
	excelFile?: string;
}

export interface ColumnConfig {
	key: string;
	label: string;
	type?: 'text' | 'date' | 'number';
	filterable?: boolean;
	showInTable?: boolean;
	showInForm?: boolean;
}
