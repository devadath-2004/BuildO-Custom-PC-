package com.buildo.dto;

import java.util.ArrayList;
import java.util.List;

public class CompatibilityCheckRequest {
    private Long cpuId;
    private Long motherboardId;
    private Long ramId;
    private Long storageId;
    private Long gpuId;
    private Long psuId;
    private Long cabinetId;
    private Long coolingId;
    private List<Long> componentIds = new ArrayList<>();

    public CompatibilityCheckRequest() {}

    public Long getCpuId() { return cpuId; }
    public void setCpuId(Long cpuId) { this.cpuId = cpuId; }

    public Long getMotherboardId() { return motherboardId; }
    public void setMotherboardId(Long motherboardId) { this.motherboardId = motherboardId; }

    public Long getRamId() { return ramId; }
    public void setRamId(Long ramId) { this.ramId = ramId; }

    public Long getStorageId() { return storageId; }
    public void setStorageId(Long storageId) { this.storageId = storageId; }

    public Long getGpuId() { return gpuId; }
    public void setGpuId(Long gpuId) { this.gpuId = gpuId; }

    public Long getPsuId() { return psuId; }
    public void setPsuId(Long psuId) { this.psuId = psuId; }

    public Long getCabinetId() { return cabinetId; }
    public void setCabinetId(Long cabinetId) { this.cabinetId = cabinetId; }

    public Long getCoolingId() { return coolingId; }
    public void setCoolingId(Long coolingId) { this.coolingId = coolingId; }

    public List<Long> getComponentIds() { return componentIds; }
    public void setComponentIds(List<Long> componentIds) { this.componentIds = componentIds; }

    public List<Long> getAllIds() {
        List<Long> ids = new ArrayList<>(componentIds != null ? componentIds : new ArrayList<>());
        if (cpuId != null && !ids.contains(cpuId)) ids.add(cpuId);
        if (motherboardId != null && !ids.contains(motherboardId)) ids.add(motherboardId);
        if (ramId != null && !ids.contains(ramId)) ids.add(ramId);
        if (storageId != null && !ids.contains(storageId)) ids.add(storageId);
        if (gpuId != null && !ids.contains(gpuId)) ids.add(gpuId);
        if (psuId != null && !ids.contains(psuId)) ids.add(psuId);
        if (cabinetId != null && !ids.contains(cabinetId)) ids.add(cabinetId);
        if (coolingId != null && !ids.contains(coolingId)) ids.add(coolingId);
        return ids;
    }
}
