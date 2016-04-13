package efs

import (
	"github.com/eaciit/dbox"
	_ "github.com/eaciit/dbox/dbc/json"
	_ "github.com/eaciit/dbox/dbc/jsons"
	_ "github.com/eaciit/dbox/dbc/mongo"
	"github.com/eaciit/efs"
	"github.com/eaciit/toolkit"
	"os"
	"testing"
)

var wd, _ = os.Getwd()

func prepareconnection() (conn dbox.IConnection, err error) {
	// conn, err = dbox.NewConnection("mongo",
	// 	&dbox.ConnectionInfo{"192.168.0.200:27017", "efspttgcc", "", "", toolkit.M{}.Set("timeout", 3)})
	conn, err = dbox.NewConnection("mongo",
		&dbox.ConnectionInfo{"localhost:27017", "efs", "", "", toolkit.M{}.Set("timeout", 3)})
	// conn, err = dbox.NewConnection("jsons",
	// 	&dbox.ConnectionInfo{wd, "", "", "", toolkit.M{}.Set("newfile", true)})
	if err != nil {
		return
	}

	err = conn.Connect()
	return
}

func TestInitialSetDatabase(t *testing.T) {
	conn, err := prepareconnection()

	if err != nil {
		t.Errorf("Error connecting to database: %s \n", err.Error())
	}

	err = efs.SetDb(conn)
	if err != nil {
		t.Errorf("Error set database to efs: %s \n", err.Error())
	}
}

func loaddatasample() (arrtkm []*efs.StatementElement, err error) {

	conn, err := dbox.NewConnection("json",
		&dbox.ConnectionInfo{toolkit.Sprintf("%v/sample.json", wd), "", "", "", nil})
	if err != nil {
		return
	}

	err = conn.Connect()
	if err != nil {
		return
	}

	c, err := conn.NewQuery().Select().Cursor(nil)
	if err != nil {
		return
	}

	arrtkm = make([]*efs.StatementElement, 0, 0)
	err = c.Fetch(&arrtkm, 0, false)

	return
}

func TestCreateStatement(t *testing.T) {
	t.Skip("Skip : Comment this line to do test")
	arrdata, err := loaddatasample()
	if err != nil {
		t.Errorf("Error to load data sample: %s \n", err.Error())
		return
	}

	// toolkit.Println(arrdata)
	ds := efs.NewStatements()
	// ds.ID = toolkit.RandomString(32)
	ds.ID = "bid1EWFRZwL-at1uyFvzJYUjPu3yuh3j"
	ds.Title = "donation"
	ds.Elements = make([]*efs.StatementElement, 0, 0)

	ds.Elements = append(ds.Elements, arrdata...)

	err = efs.Save(ds)
	if err != nil {
		t.Errorf("Error to save efs: %s \n", err.Error())
		return
	}
}

func TestRunStatement(t *testing.T) {
	// t.Skip("Skip : Comment this line to do test")
	sid := "bid1EWFRZwL-at1uyFvzJYUjPu3yuh3j"
	// sid = "qZ-SesL2s0Q7VODxyWj6-RVlqsa56ZMJ"

	ds := new(efs.Statements)
	err := efs.Get(ds, sid)
	if err != nil {
		t.Errorf("Error to get statement by id, found : %s \n", err.Error())
		return
	}
	// toolkit.Printf("Statements : %#v\n\n", ds)

	tsv, _ := ds.Run(nil)
	// tsv.StatementID = sid

	// ======================
	// Simulate the data will be change before send
	// ======================
	tsv.ID = toolkit.RandomString(32)
	tsv.Title = "v.2015"

	tsv.Element[0].ValueNum = 10000
	tsv.Element[2].ValueNum = 1000
	tsv.Element[3].Formula = []string{"@1", "*", "10", "/", "100"}
	tsv.Element[4].Formula = []string{"@1", "*", "5", "/", "100"}
	tsv.Element[9].Formula = []string{"@1", "+", "fn:SUM(@3..@5)"}
	// ======================
	ins := toolkit.M{}.Set("data", tsv)
	sv, err := ds.Run(ins)
	if err != nil {
		t.Errorf("Error to get run, found : %s \n", err.Error())
		if err.Error() != "Formula not completed run" {
			return
		}
	}

	toolkit.Printf("Statements Version :%#v - %v \n", sv.ID, sv.Title)
	for _, val := range sv.Element {
		toolkit.Printf("%v. %v:%v [%v - %v - %#v] \n", val.StatementElement.Index, val.StatementElement.Title1, val.StatementElement.Title2, val.Formula, val.ValueTxt, val.ValueNum)
	}
}

func TestSaveStatementVersion(t *testing.T) {
	t.Skip("Skip : Comment this line to do test")
	sid := "bid1EWFRZwL-at1uyFvzJYUjPu3yuh3j"

	ds := new(efs.Statements)
	err := efs.Get(ds, sid)
	if err != nil {
		t.Errorf("Error to get statement by id, found : %s \n", err.Error())
		return
	}

	ins := toolkit.M{}.Set("title", "base-v1")
	sv, _ := ds.Run(ins)

	filter := dbox.And(dbox.Eq("statementid", sv.StatementID), dbox.Eq("title", sv.Title))
	tsv := new(efs.StatementVersion)

	c, err := efs.Find(tsv, filter, nil)
	_ = c.Fetch(&tsv, 1, false)

	toolkit.Printf("%#v\n", tsv.ID)
	if tsv.ID != "" {
		sv.ID = tsv.ID
	}

	err = efs.Save(sv)
	toolkit.Printf("%#v\n", sv.ID)
	toolkit.Printf("%#v\n", err)
}