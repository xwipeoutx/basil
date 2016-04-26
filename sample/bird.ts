export class Bird {
    private flyStartTime: number = null
    
    numLegs = 2
    numWings = 2
    
    get isFlying() { 
        return this.flyStartTime != null 
            && this.flyStartTime < +new Date();
    }
    
    flap() {
        if (this.numWings == 0)
            throw new Error("Wings are broken, cannot fly");
            
        this.flyStartTime = +new Date();
    }
    
    hitTree() {
        this.flyStartTime = null;
        this.numWings = 0;
    }
}